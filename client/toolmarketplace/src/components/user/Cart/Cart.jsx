import React, { useContext, useState } from 'react';
import { CartContext } from '../../../redux context/CartContext';
import { Link } from 'react-router-dom';
import OrderForm from '../orders/OrderForm';
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import './Cart.css';

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, totalAmount, loading, error } = useContext(CartContext);
    const [showOrderForm, setShowOrderForm] = useState(false);

    const handleQuantityChange = (productId, value) => {
        const qty = parseInt(value, 10);
        if (qty >= 1) {
            updateQuantity(productId, qty);
        }
    };

    const toggleOrderForm = () => {
        setShowOrderForm(!showOrderForm);
    };

    return (
        <Container className="py-4 cart-container">
            <h1 className="mb-4 cart-title">Корзина</h1>
            {loading ? (
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <h6 className="mt-3">Загрузка корзины...</h6>
                </div>
            ) : cartItems.length === 0 ? (
                <p className="empty-cart">
                    Ваша корзина пуста. <Link to="/">Перейти к покупкам</Link>
                </p>
            ) : (
                <>
                    {error && (
                        <div className="mb-3">
                            <div className="alert alert-danger">{error}</div>
                        </div>
                    )}
                    <Row>
                        {cartItems.map((item) => (
                            <Col xs={12} key={item.productId} className="mb-4">
                                <Card className="d-flex flex-row cart-card mb-3">
                                    {item.Product && item.Product.photo && (
                                        <Card.Img
                                            variant="top"
                                            src={`http://localhost:5000${item.Product.photo}`}
                                            alt={item.Product.name}
                                            className="cart-img"
                                        />
                                    )}
                                    <Card.Body className="cart-card-body">
                                        <Card.Title className="cart-product-title">
                                            {item.Product ? item.Product.name : 'Продукт не найден'}
                                        </Card.Title>
                                        <Card.Text className="cart-product-desc">
                                            {item.Product ? item.Product.description : 'Описание отсутствует'}
                                        </Card.Text>
                                        <Card.Text className="cart-product-price">
                                            Цена за единицу: {item.Product ? item.Product.price : '0'} ₽
                                        </Card.Text>
                                        <div className="d-flex align-items-center mt-2 cart-quantity-group">
                                            <Form.Group controlId={`quantity-${item.productId}`} className="me-2 quantity-group">
                                                <Form.Control
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                                                    className="quantity-input"
                                                />
                                            </Form.Group>
                                            <Button variant="outline-secondary" onClick={() => removeFromCart(item.productId)}>
                                                Удалить
                                            </Button>
                                        </div>
                                        <Card.Text className="mt-2 cart-total-price">
                                            Итого: {item.Product ? item.Product.price * item.quantity : 0} ₽
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <hr />
                    <h2 className="cart-total-amount">Общая сумма: {totalAmount} ₽</h2>
                    <Button variant="primary" onClick={toggleOrderForm} className="mt-3 order-toggle-btn">
                        {showOrderForm ? 'Отмена' : 'Сформировать заказ'}
                    </Button>
                    {showOrderForm && (
                        <div className="mt-3 order-form-wrapper">
                            <OrderForm />
                        </div>
                    )}
                </>
            )}
        </Container>
    );
}

export default Cart;