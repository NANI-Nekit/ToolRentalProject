import React from 'react';
import { Container, Card } from 'react-bootstrap';

function ReviewList({ reviews }) {
    if (!reviews || reviews.length === 0) {
        return (
            <Container className="py-4">
                <h6>Отзывов пока нет.</h6>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {reviews.map((review) => (
                <Card key={review.id} className="mb-3">
                    <Card.Body>
                        <Card.Title>
                            <strong>Рейтинг:</strong> {review.rating} / 5
                        </Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                            <strong>Краткий отзыв:</strong> {review.shortReview}
                        </Card.Subtitle>
                        <Card.Text>
                            <strong>Описание:</strong> {review.reviewText}
                        </Card.Text>
                        <Card.Text>
                            <strong>Пользователь:</strong> {review.User?.firstName} {review.User?.lastName}
                        </Card.Text>
                        <Card.Text>
                            <small className="text-muted">
                                <strong>Дата:</strong> {new Date(review.createdAt).toLocaleString()}
                            </small>
                        </Card.Text>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    );
}

export default ReviewList;
