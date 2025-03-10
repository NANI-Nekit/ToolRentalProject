const { Review, User, Toolseller, Order } = require('../models/models');

class ReviewController {

    async createReview(req, res) {
        try {
            const { rating, shortReview, reviewText, orderId } = req.body;
            const userId = req.user.userId;

            if (!userId) {
                return res.status(401).json({ message: 'Неавторизованный пользователь' });
            }

            const order = await Order.findByPk(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            // Проверка: отзыв можно оставить только для выполненных заказов (status: delivered)
            if (order.status !== 'delivered') {
                return res.status(400).json({ message: 'Отзыв можно оставить только для выполненных заказов' });
            }

            const existingReview = await Review.findOne({ where: { orderId } });
            if (existingReview) {
                return res.status(400).json({ message: 'Отзыв для данного заказа уже существует' });
            }

            const toolsellerId = order.toolsellerId;

            const review = await Review.create({
                rating,
                shortReview,
                reviewText,
                orderId,
                toolsellerId,
                userId,
            });

            res.status(201).json(review);
        } catch (error) {
            console.error('Ошибка при создании отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getReviewById(req, res) {
        try {
            const { id } = req.params;

            const review = await Review.findByPk(id, {
                include: [
                    { model: Order },
                    { model: Toolseller },
                    { model: User, attributes: ['firstName', 'lastName'] },
                ],
            });

            if (!review) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }

            res.json(review);
        } catch (error) {
            console.error('Ошибка при получении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getAllReviews(req, res) {
        try {
            const reviews = await Review.findAll({
                include: [
                    { model: Order },
                    { model: Toolseller },
                    { model: User, attributes: ['firstName', 'lastName'] },
                ],
                order: [['createdAt', 'DESC']],
            });

            res.json(reviews);
        } catch (error) {
            console.error('Ошибка при получении отзывов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async updateReview(req, res) {
        try {
            const { id } = req.params;
            const { rating, shortReview, reviewText } = req.body;
            const userId = req.user.userId;

            const review = await Review.findByPk(id);
            if (!review) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }

            if (review.userId !== userId) {
                return res.status(403).json({ message: 'Нет доступа для редактирования этого отзыва' });
            }

            await review.update({
                rating,
                shortReview,
                reviewText,
            });

            res.json(review);
        } catch (error) {
            console.error('Ошибка при обновлении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async deleteReview(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            const review = await Review.findByPk(id);
            if (!review) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }

            if (review.userId !== userId) {
                return res.status(403).json({ message: 'Нет доступа для удаления этого отзыва' });
            }

            await review.destroy();

            res.status(200).json({ message: 'Отзыв успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getReviewsByToolseller(req, res) {
        try {
            const { toolsellerId } = req.params;

            const reviews = await Review.findAll({
                where: { toolsellerId },
                include: [
                    { model: Order },
                    { model: Toolseller },
                    { model: User, attributes: ['firstName', 'lastName'] },
                ],
                order: [['createdAt', 'DESC']],
            });

            res.json(reviews);
        } catch (error) {
            console.error('Ошибка при получении отзывов продавца:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new ReviewController();
