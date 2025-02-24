import React, { useEffect, useState, useContext } from 'react';
import axios from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Container, ListGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

function ToolsellerAdmin() {
    const { authData } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    // Вместо того, чтобы устанавливать ошибку и полностью прекращать рендеринг, можно просто оставить пустой массив
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/api/reviews/toolseller/${authData.user.id}`);
            setReviews(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка при получении отзывов:', err);
            // Если сервер возвращает ошибку из-за отсутствия отзывов, сбрасываем список в пустой массив
            setReviews([]);
            setLoading(false);
            // Либо, если хотите отобразить ошибку, можно сохранить её, но при этом навигация должна отображаться
            // setError('Не удалось загрузить отзывы.');
        }
    };

    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (total / reviews.length).toFixed(1);
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(<FaStar key={i} color="#FFD700" />);
            } else if (rating >= i - 0.5) {
                stars.push(<FaStarHalfAlt key={i} color="#FFD700" />);
            } else {
                stars.push(<FaRegStar key={i} color="#ccc" />);
            }
        }
        return stars;
    };

    if (loading) {
        return (
            <Container className="text-center" style={{ marginTop: '50px' }}>
                <Spinner animation="border" variant="primary" />
                <h6 className="mt-3">Загрузка отзывов...</h6>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h1 className="mb-4">Панель управления продавца</h1>
            <div className="mb-4">
                <h6>Рейтинг: {calculateAverageRating()} / 5</h6>
                <div className="d-flex align-items-center">
                    {renderStars(calculateAverageRating())}
                    <span className="ms-2 text-muted">({reviews.length} отзывов)</span>
                </div>
            </div>
            <ListGroup className="mb-4">
                <ListGroup.Item>
                    <Button as={Link} to="/toolseller-admin/edit" variant="outline-primary" className="w-100">
                        Редактировать информацию о продавце
                    </Button>
                </ListGroup.Item>
                <ListGroup.Item>
                    <Button as={Link} to="/toolseller-admin/products" variant="outline-primary" className="w-100">
                        Управление товарами
                    </Button>
                </ListGroup.Item>
                <ListGroup.Item>
                    <Button as={Link} to="/toolseller-admin/orders" variant="outline-primary" className="w-100">
                        Управление заказами
                    </Button>
                </ListGroup.Item>
            </ListGroup>
            {error && <Alert variant="danger">{error}</Alert>}
            <h5 className="mb-3">Отзывы</h5>
            {reviews.length > 0 ? (
                reviews.map((review) => (
                    <div key={review.id} className="mb-3">
                        <hr />
                        <h6>
                            {review.User?.firstName} {review.User?.lastName} оценил(а) на {review.rating} звезд
                        </h6>
                        <p>
                            <em>{review.shortReview}</em>
                        </p>
                        <p>{review.reviewText}</p>
                        <small>{new Date(review.createdAt).toLocaleString()}</small>
                    </div>
                ))
            ) : (
                <p>Нет отзывов.</p>
            )}
        </Container>
    );
}

export default ToolsellerAdmin;