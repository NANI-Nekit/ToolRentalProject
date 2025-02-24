import React, { useEffect, useState, useContext } from 'react';
import axios from '../../../api/axiosConfig';
import { AuthContext } from '../../../context/AuthContext';
import {
    Container,
    Button,
    Spinner,
    Alert,
    Form,
    Row,
    Col,
    Card,
    ListGroup,
    Modal,
} from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import './Orders.css';

function Orders() {
    const { authData } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        shortReview: '',
        reviewText: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [searchDate, setSearchDate] = useState('');
    const [searchStatus, setSearchStatus] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [error, setError] = useState(null);

    // Допустимые статусы для фильтрации
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchDate, searchStatus, orders]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/orders', {
                headers: { Authorization: `Bearer ${authData.token}` },
            });
            setOrders(response.data);
            setFilteredOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка при получении заказов пользователя:', err);
            setLoading(false);
            setError('Не удалось загрузить заказы');
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];
        if (searchDate) {
            filtered = filtered.filter(order =>
                new Date(order.date_of_ordering || order.orderDate)
                    .toISOString()
                    .startsWith(searchDate)
            );
        }
        if (searchStatus) {
            filtered = filtered.filter(order => order.status === searchStatus);
        }
        setFilteredOrders(filtered);
    };

    const handleCancelOrder = async () => {
        if (!orderToCancel) return;
        try {
            await axios.put(
                `/api/orders/${orderToCancel}/status`,
                { status: 'отменён' },
                { headers: { Authorization: `Bearer ${authData.token}` } }
            );
            setOrders(prev =>
                prev.map(order =>
                    order.id === orderToCancel ? { ...order, status: 'отменён' } : order
                )
            );
            alert('Заказ успешно отменён.');
        } catch (err) {
            console.error('Ошибка при отмене заказа:', err);
            alert('Не удалось отменить заказ.');
        } finally {
            setOrderToCancel(null);
            setShowCancelModal(false);
        }
    };

    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setReviewData(prev => ({ ...prev, [name]: value }));
    };

    const handleStarClick = (rating) => {
        setReviewData(prev => ({ ...prev, rating }));
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewData.shortReview.trim() || !reviewData.reviewText.trim()) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        setSubmitting(true);
        try {
            await axios.post(
                '/api/reviews',
                { ...reviewData, orderId: selectedOrder.id },
                { headers: { Authorization: `Bearer ${authData.token}` } }
            );
            alert('Отзыв успешно создан!');
            setSubmitting(false);
            setSelectedOrder(null);
            setReviewData({ rating: 5, shortReview: '', reviewText: '' });
            fetchOrders();
        } catch (err) {
            console.error('Ошибка при создании отзыва:', err);
            alert(err.response?.data?.message || 'Не удалось создать отзыв');
            setSubmitting(false);
        }
    };

    // Рендер звезд для рейтинга
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(<FaStar key={i} color={rating >= i ? '#FFD700' : '#ccc'} />);
        }
        return stars;
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <h6 className="mt-3">Загрузка заказов...</h6>
            </Container>
        );
    }

    return (
        <Container className="py-4 orders-container">
            <h1 className="mb-4 orders-title">Мои заказы</h1>

            {/* Фильтры */}
            <Form className="mb-4 orders-filters">
                <Row className="align-items-end">
                    <Col xs={12} sm={4}>
                        <Form.Group controlId="searchDate">
                            <Form.Label>Дата заказа</Form.Label>
                            <Form.Control
                                type="date"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={4}>
                        <Form.Group controlId="searchStatus">
                            <Form.Label>Статус</Form.Label>
                            <Form.Select
                                value={searchStatus}
                                onChange={(e) => setSearchStatus(e.target.value)}
                            >
                                <option value="">Все</option>
                                {allowedStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={4} className="text-sm-end mt-3 mt-sm-0">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setSearchDate('');
                                setSearchStatus('');
                            }}
                            className="reset-filters-btn"
                        >
                            Сбросить фильтры
                        </Button>
                    </Col>
                </Row>
            </Form>

            {filteredOrders.length === 0 ? (
                <p className="no-orders">У вас ещё нет заказов.</p>
            ) : (
                <ListGroup className="orders-list">
                    {filteredOrders.map(order => (
                        <ListGroup.Item key={order.id} className="mb-3 order-item">
                            <h5>Заказ №{order.id}</h5>
                            <p>
                                <strong>Адрес доставки:</strong>{' '}
                                {order.delivery_address || order.deliveryAddress}
                            </p>
                            <p>
                                <strong>Дата заказа:</strong>{' '}
                                {new Date(order.date_of_ordering || order.orderDate).toLocaleString()}
                            </p>
                            <p>
                                <strong>Статус:</strong> {order.status}
                            </p>
                            <p>
                                <strong>Способ оплаты:</strong>{' '}
                                {order.payment_method || order.paymentMethod}
                            </p>
                            <p>
                                <strong>Номер для отслеживания:</strong>{' '}
                                {order.tracking_number || order.trackingNumber || '—'}
                            </p>
                            <p>
                                <strong>Итоговая сумма:</strong>{' '}
                                {order.total_cost || order.totalCost} ₽
                            </p>
                            <h6>Товары:</h6>
                            <ul className="order-products">
                                {order.OrderItems.map(item => (
                                    <li key={item.id}>
                                        {item.Product.name} x {item.quantity} ={' '}
                                        {(item.priceAtPurchase || item.Product.price) * item.quantity} ₽
                                    </li>
                                ))}
                            </ul>
                            {order.status === 'delivered' && !order.Review && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="mt-2 review-btn"
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setShowReviewModal(true);
                                    }}
                                >
                                    Написать отзыв
                                </Button>
                            )}
                            {order.status === 'pending' && (
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="mt-2 cancel-btn"
                                    onClick={() => {
                                        setOrderToCancel(order.id);
                                        setShowCancelModal(true);
                                    }}
                                >
                                    Отменить заказ
                                </Button>
                            )}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {/* Модальное окно для отзыва */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Написать отзыв</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex align-items-center mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <FaStar
                                key={star}
                                size={24}
                                color={reviewData.rating >= star ? '#FFD700' : '#ccc'}
                                className="review-star"
                                onClick={() => handleStarClick(star)}
                            />
                        ))}
                    </div>
                    <Form>
                        <Form.Group controlId="shortReview" className="mb-3">
                            <Form.Label>Короткий отзыв</Form.Label>
                            <Form.Control
                                type="text"
                                name="shortReview"
                                value={reviewData.shortReview}
                                onChange={handleReviewChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="reviewText" className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="reviewText"
                                value={reviewData.reviewText}
                                onChange={handleReviewChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleSubmitReview} disabled={submitting}>
                        {submitting ? 'Отправка...' : 'Отправить'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Модальное окно для отмены заказа */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение отмены</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Вы уверены, что хотите отменить этот заказ? Это действие нельзя отменить.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="danger" onClick={handleCancelOrder}>
                        Отменить
                    </Button>
                </Modal.Footer>
            </Modal>

            {error && (
                <Alert variant="danger" className="mt-3 orders-error">
                    {error}
                </Alert>
            )}
        </Container>
    );
}

export default Orders;