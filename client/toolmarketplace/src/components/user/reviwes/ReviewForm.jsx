import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ReviewForm.css';

function ReviewForm({ toolsellerId, onSubmit }) {
    const [rating, setRating] = useState(5);
    const [shortReview, setShortReview] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [orderId, setOrderId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!orderId) {
            toast.error('Пожалуйста, введите ID заказа');
            return;
        }

        if (rating < 1 || rating > 5) {
            toast.error('Рейтинг должен быть от 1 до 5');
            return;
        }

        onSubmit({
            rating,
            shortReview,
            reviewText,
            orderId,
            toolsellerId,
        });

        setRating(5);
        setShortReview('');
        setReviewText('');
        setOrderId('');
    };

    return (
        <Container className="py-4 reviewform-container">
            <h5 className="mb-3 reviewform-title">Написать отзыв</h5>
            <ToastContainer />
            <Form onSubmit={handleSubmit} className="reviewform-form">
                <Form.Group controlId="rating" className="mb-3">
                    <Form.Label>Рейтинг</Form.Label>
                    <Form.Select
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value, 10))}
                        className="reviewform-select"
                    >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group controlId="shortReview" className="mb-3">
                    <Form.Label>Краткий отзыв</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Введите краткий отзыв"
                        value={shortReview}
                        onChange={(e) => setShortReview(e.target.value)}
                        required
                        className="reviewform-input"
                    />
                </Form.Group>
                <Form.Group controlId="reviewText" className="mb-3">
                    <Form.Label>Описание</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Введите подробное описание"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                        className="reviewform-textarea"
                    />
                </Form.Group>
                <Form.Group controlId="orderId" className="mb-3">
                    <Form.Label>ID Заказа</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Введите ID заказа"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        required
                        className="reviewform-input"
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="reviewform-btn">
                    Отправить отзыв
                </Button>
            </Form>
        </Container>
    );
}

export default ReviewForm;