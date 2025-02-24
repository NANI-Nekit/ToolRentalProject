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

    // Получаем актуальные данные пользователя, как и в NavigationBar
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
        discountPoints: 0
    });
    const [loading, setLoading] = useState(false);

    // Вычисляем итоговую цену: общая сумма минус скидка (не менее 0)
    const finalPrice = Math.max(totalAmount - Number(formData.discountPoints), 0);

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
        try {
            // Можно добавить итоговую цену в данные заказа, если сервер это поддерживает
            const dataToSend = { ...formData, finalPrice };
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
                        value={`${finalPrice} ₽`}
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
