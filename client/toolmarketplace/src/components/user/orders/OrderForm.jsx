import React, { useState, useContext, useEffect } from 'react';
import axios from '../../../redux context/api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../redux context/AuthContext';
import { CartContext } from '../../../redux context/CartContext';
import { Container, Form, Button } from 'react-bootstrap';
import './OrderForm.css';

function OrderForm() {
    const { clearCart, totalAmount } = useContext(CartContext);
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();

    // Получаем актуальные данные пользователя
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/api/users/auth', {
                    headers: { Authorization: `Bearer ${authData.token}` },
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Ошибка при получении данных пользователя:', error);
            }
        };
        if (authData.isAuthenticated) {
            fetchUserData();
        }
    }, [authData.isAuthenticated, authData.token]);

    // Если данные не загружены, можно задать 0 по умолчанию
    const maxDiscountPoints = userData?.points || 0;

    const [formData, setFormData] = useState({
        deliveryAddress: '',
        description: '',
        paymentMethod: 'cash',
        discountPoints: 0,
        orderType: 'purchase', // По умолчанию покупка
        rentalStartDate: '',
        rentalEndDate: '',
    });
    const [loading, setLoading] = useState(false);

    // Вычисляем итоговую цену в зависимости от типа заказа
    let computedFinalPrice = 0;
    if (formData.orderType === 'rental' && formData.rentalStartDate && formData.rentalEndDate) {
        const startDate = new Date(formData.rentalStartDate);
        const endDate = new Date(formData.rentalEndDate);
        const diffMs = endDate - startDate;
        if (diffMs > 0) {
            const rentalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const rentalRateFactor = 0.1; // 10% от цены за день
            computedFinalPrice = Math.max(totalAmount * rentalDays * rentalRateFactor - Number(formData.discountPoints), 0);
        } else {
            computedFinalPrice = 0;
        }
    } else {
        computedFinalPrice = Math.max(totalAmount - Number(formData.discountPoints), 0);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'discountPoints') {
            const parsed = Number(value);
            // Ограничиваем значение максимумом userData.points
            const limited = parsed > maxDiscountPoints ? maxDiscountPoints : parsed;
            setFormData({ ...formData, discountPoints: limited });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Если выбран режим аренды, можно добавить дополнительную валидацию
        if (formData.orderType === 'rental') {
            if (!formData.rentalStartDate || !formData.rentalEndDate) {
                alert('Пожалуйста, укажите сроки аренды');
                setLoading(false);
                return;
            }
            const startDate = new Date(formData.rentalStartDate);
            const endDate = new Date(formData.rentalEndDate);
            if (endDate <= startDate) {
                alert('Дата окончания аренды должна быть позже даты начала');
                setLoading(false);
                return;
            }
        }

        try {
            const dataToSend = { ...formData, finalPrice: computedFinalPrice };
            await axios.post('/api/orders', dataToSend, {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            alert('Заказ успешно оформлен!');
            clearCart();
            navigate('/orders');
        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            alert('Произошла ошибка при оформлении заказа.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4 orderform-container">
            <h1 className="mb-4 orderform-title">Оформление заказа</h1>
            <Form onSubmit={handleSubmit} className="orderform-form">
                <Form.Group controlId="formDeliveryAddress" className="mb-3">
                    <Form.Label>Адрес доставки</Form.Label>
                    <Form.Control
                        type="text"
                        name="deliveryAddress"
                        required
                        value={formData.deliveryAddress}
                        onChange={handleChange}
                        placeholder="Введите адрес доставки"
                    />
                </Form.Group>
                <Form.Group controlId="formPaymentMethod" className="mb-3">
                    <Form.Label>Способ оплаты</Form.Label>
                    <Form.Select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                    >
                        <option value="cash">Наличные</option>
                        <option value="card">Карта</option>
                        <option value="online">Онлайн-оплата</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group controlId="formOrderType" className="mb-3">
                    <Form.Label>Тип заказа</Form.Label>
                    <Form.Select
                        name="orderType"
                        value={formData.orderType}
                        onChange={handleChange}
                    >
                        <option value="purchase">Покупка</option>
                        <option value="rental">Аренда</option>
                    </Form.Select>
                    {formData.orderType === 'rental' && (
                        <Form.Text className="text-muted">
                            При аренде заказ должен содержать только один товар.
                        </Form.Text>
                    )}
                </Form.Group>
                {formData.orderType === 'rental' && (
                    <>
                        <Form.Group controlId="formRentalStartDate" className="mb-3">
                            <Form.Label>Дата начала аренды</Form.Label>
                            <Form.Control
                                type="date"
                                name="rentalStartDate"
                                required={formData.orderType === 'rental'}
                                value={formData.rentalStartDate}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formRentalEndDate" className="mb-3">
                            <Form.Label>Дата окончания аренды</Form.Label>
                            <Form.Control
                                type="date"
                                name="rentalEndDate"
                                required={formData.orderType === 'rental'}
                                value={formData.rentalEndDate}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </>
                )}
                <Form.Group controlId="formDiscountPoints" className="mb-3">
                    <Form.Label>Использовать баллы для скидки</Form.Label>
                    <Form.Range
                        name="discountPoints"
                        value={formData.discountPoints}
                        onChange={handleChange}
                        min="0"
                        max={maxDiscountPoints}
                        step="1"
                    />
                    <Form.Text className="text-muted">
                        {formData.discountPoints} из {maxDiscountPoints} баллов
                    </Form.Text>
                </Form.Group>
                <Form.Group controlId="finalPrice" className="mb-3">
                    <Form.Label>Итоговая цена с учётом скидки</Form.Label>
                    <Form.Control
                        type="text"
                        value={`${computedFinalPrice} ₽`}
                        readOnly
                    />
                </Form.Group>
                <Form.Group controlId="formDescription" className="mb-3">
                    <Form.Label>Пожелания</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Введите ваши пожелания"
                    />
                </Form.Group>
                <Button type="submit" variant="primary" disabled={loading} className="orderform-btn">
                    {loading ? 'Оформление...' : 'Сформировать заказ'}
                </Button>
            </Form>
        </Container>
    );
}

export default OrderForm;
