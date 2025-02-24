const { Order, OrderItem, Basket, BasketItem, Product, User, Toolseller, Review } = require('../models/models');

class OrderController {

    async createOrder(req, res) {
        try {
            const { deliveryAddress, paymentMethod, discountPoints } = req.body;
            const userId = req.user.userId;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            const basket = await Basket.findOne({
                where: { userId },
                include: [
                    {
                        model: BasketItem,
                        include: [Product],
                    },
                ],
            });

            if (!basket || !basket.BasketItems || basket.BasketItems.length === 0) {
                return res.status(400).json({ message: 'Ваша корзина пуста' });
            }

            let totalCost = basket.BasketItems.reduce((acc, item) => {
                return acc + parseFloat(item.Product.price) * item.quantity;
            }, 0);

            const toolsellerIds = [...new Set(basket.BasketItems.map((item) => item.Product.toolsellerId))];
            if (toolsellerIds.length > 1) {
                return res.status(400).json({ message: 'Все товары должны принадлежать одному продавцу' });
            }

            let appliedDiscount = 0;
            if (discountPoints && discountPoints > 0) {
                if (user.points < discountPoints) {
                    return res.status(400).json({ message: 'Недостаточно баллов для применения скидки' });
                }
                appliedDiscount = discountPoints;
                totalCost = Math.max(totalCost - appliedDiscount, 0);

                user.points -= discountPoints;
                await user.save();
            }

            const trackingNumber = `TRK-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

            const order = await Order.create({
                deliveryAddress,
                totalCost,
                status: 'pending',
                paymentMethod,
                trackingNumber,
                orderDate: new Date(),
                userId,
                toolsellerId: toolsellerIds[0],
            });

            const orderItems = basket.BasketItems.map((item) => ({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: item.Product.price,
            }));

            await OrderItem.bulkCreate(orderItems);
            await BasketItem.destroy({ where: { basketId: basket.id } });

            res.status(201).json({ message: 'Заказ успешно создан', order });
        } catch (error) {
            console.error('Ошибка при создании заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getUserOrders(req, res) {
        try {
            const userId = req.user.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Неавторизованный пользователь' });
            }

            const orders = await Order.findAll({
                where: { userId },
                include: [
                    {
                        model: OrderItem,
                        include: [Product],
                    },
                    {
                        model: Review,
                        include: [{ model: User, attributes: ['firstName', 'lastName'] }],
                    },
                ],
                order: [['orderDate', 'DESC']],
            });

            res.json(orders);
        } catch (error) {
            console.error('Ошибка при получении заказов пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getOrderById(req, res) {
        try {
            const { id } = req.params;

            const order = await Order.findByPk(id, {
                include: [
                    {
                        model: OrderItem,
                        include: [Product],
                    },
                    {
                        model: Review,
                        include: [{ model: User, attributes: ['firstName', 'lastName'] }],
                    },
                ],
            });

            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            res.json(order);
        } catch (error) {
            console.error('Ошибка при получении заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const order = await Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            // Допустимые статусы согласно обновленной модели
            const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ message: 'Недопустимый статус заказа' });
            }

            // Если заказ переводится в статус delivered, начисляем баллы пользователю
            if (status === 'delivered' && order.status !== 'delivered') {
                // Начисляем 1 балл за каждые 100 единиц цены заказа
                const bonusPoints = Math.floor(order.totalCost / 100);

                // Находим пользователя, сделавшего заказ, и обновляем его баллы
                const user = await User.findByPk(order.userId);
                if (user) {
                    user.points += bonusPoints;
                    await user.save();
                }
            }

            order.status = status;
            await order.save();

            res.json(order);
        } catch (error) {
            console.error('Ошибка при обновлении статуса заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async deleteOrder(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            if (req.user.userId) {
                if (order.userId !== req.user.userId) {
                    return res.status(403).json({ message: 'Нет прав для удаления этого заказа' });
                }
            } else if (req.user.toolsellerId) {
                if (order.toolsellerId !== req.user.toolsellerId) {
                    return res.status(403).json({ message: 'Нет прав для удаления этого заказа' });
                }
            } else {
                return res.status(403).json({ message: 'Нет прав для удаления этого заказа' });
            }

            await OrderItem.destroy({ where: { orderId: id } });
            await order.destroy();
            res.status(200).json({ message: 'Заказ успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }


    async getToolsellerOrders(req, res) {
        try {
            const toolsellerId = req.user.toolsellerId;
            console.log('Получение заказов для продавца ID:', toolsellerId);
            if (!toolsellerId) {
                return res.status(401).json({ message: 'Неавторизованный пользователь' });
            }

            const toolseller = await Toolseller.findByPk(toolsellerId);
            if (!toolseller) {
                return res.status(404).json({ message: 'Продавец не найден' });
            }

            const orders = await Order.findAll({
                where: { toolsellerId: toolseller.id },
                include: [
                    {
                        model: User,
                        attributes: ['firstName', 'lastName', 'phone'],
                    },
                    {
                        model: OrderItem,
                        include: [Product],
                    },
                ],
                order: [['orderDate', 'DESC']],
            });

            res.json(orders);
        } catch (error) {
            console.error('Ошибка при получении заказов продавца:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new OrderController();
