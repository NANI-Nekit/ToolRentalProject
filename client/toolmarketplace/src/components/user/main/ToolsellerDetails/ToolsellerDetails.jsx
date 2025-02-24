import React, { useEffect, useState, useContext } from 'react';
import axios from '../../../../redux context/api/axiosConfig';
import { useParams } from 'react-router-dom';
import { CartContext } from '../../../../redux context/CartContext';
import { AuthContext } from '../../../../redux context/AuthContext';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Form,
    Spinner,
    Alert,
} from 'react-bootstrap';
import ComparisonPanel from '../../ComparisonPanel/ComparisonPanel';
import './ToolsellerDetails.css';

function ToolsellerDetails() {
    const { id } = useParams();
    const { cartItems, addToCart, clearCart } = useContext(CartContext);
    const { authData } = useContext(AuthContext);
    const [toolseller, setToolseller] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({});
    const [error, setError] = useState(null);
    const [comparisonItems, setComparisonItems] = useState([]);

    // Состояния для поиска и сортировки товаров
    const [searchQuery, setSearchQuery] = useState('');
    const [sortCriteria, setSortCriteria] = useState('');

    useEffect(() => {
        fetchToolseller();
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchToolseller = async () => {
        try {
            const response = await axios.get(`/api/toolsellers/${id}`);
            setToolseller(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка при получении информации о продавце:', err);
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/api/reviews/toolseller/${id}`);
            setReviews(response.data);
        } catch (err) {
            console.error('Ошибка при получении отзывов:', err);
        }
    };

    const handleQuantityChange = (productId, value) => {
        const qty = parseInt(value, 10);
        if (qty >= 1) {
            setQuantities((prev) => ({ ...prev, [productId]: qty }));
        }
    };

    const handleAddToCart = async (product) => {
        const quantity = quantities[product.id] || 1;
        try {
            await addToCart(product, quantity);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddToCompare = (product) => {
        setComparisonItems((prev) => {
            if (prev.find((item) => item.id === product.id)) return prev;
            return [...prev, product];
        });
    };

    const handleRemoveFromCompare = (productId) => {
        setComparisonItems((prev) => prev.filter((item) => item.id !== productId));
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

    // Проверка: если в корзине уже есть товары от другого продавца
    const isDifferentToolseller =
        cartItems.length > 0 &&
        cartItems[0].Product.toolsellerId !== parseInt(id, 10);

    // Фильтрация и сортировка товаров
    let filteredProducts = toolseller?.Products || [];
    if (searchQuery) {
        filteredProducts = filteredProducts.filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    if (sortCriteria) {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            if (sortCriteria === 'name') {
                return a.name.localeCompare(b.name);
            }
            if (sortCriteria === 'price') {
                return parseFloat(a.price) - parseFloat(b.price);
            }
            return 0;
        });
    }

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <h6 className="mt-3">Загрузка информации о продавце...</h6>
            </Container>
        );
    }

    return (
        <Container className="py-4 toolseller-details-container">
            {/* Панель сравнения */}
            <ComparisonPanel
                items={comparisonItems}
                onRemove={handleRemoveFromCompare}
                onAddToCart={handleAddToCart}
            />

            {toolseller ? (
                <div className="toolseller-info">
                    <h1 className="company-name">{toolseller.companyName}</h1>
                    <div className="d-flex align-items-center mb-3 rating-section">
                        <h6 className="me-2">Рейтинг:</h6>
                        <div className="d-flex align-items-center">
                            {renderStars(calculateAverageRating())}
                            <h6 className="ms-2">{calculateAverageRating()} / 5</h6>
                        </div>
                        <span className="ms-2 text-muted">
                            ({reviews.length} отзывов)
                        </span>
                    </div>
                    {toolseller.logo && (
                        <div className="logo-wrapper mb-3">
                            <img
                                src={`http://localhost:5000${toolseller.logo}`}
                                alt={toolseller.companyName}
                                className="company-logo"
                            />
                        </div>
                    )}
                    <div className="info-details">
                        <p>
                            <strong>Описание:</strong> {toolseller.description}
                        </p>
                        <p>
                            <strong>Регистрационный номер:</strong> {toolseller.registrationNumber}
                        </p>
                        <p>
                            <strong>Адрес:</strong> {toolseller.address}
                        </p>
                        <p>
                            <strong>Телефон:</strong> {toolseller.phone}
                        </p>
                        <p>
                            <strong>Контактное лицо:</strong> {toolseller.contactPerson}
                        </p>
                        {toolseller.establishedYear && (
                            <p>
                                <strong>Год основания:</strong> {toolseller.establishedYear}
                            </p>
                        )}
                    </div>

                    <h2 className="mt-4 section-title">Товары</h2>
                    {/* Форма поиска и сортировки товаров */}
                    <Row className="mb-3 search-sort-section">
                        <Col xs={12} md={6}>
                            <Form.Group controlId="searchQuery">
                                <Form.Label>Поиск по названию</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите название инструмента"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group controlId="sortCriteria">
                                <Form.Label>Сортировка</Form.Label>
                                <Form.Select
                                    value={sortCriteria}
                                    onChange={(e) => setSortCriteria(e.target.value)}
                                >
                                    <option value="">Без сортировки</option>
                                    <option value="name">По названию</option>
                                    <option value="price">По цене</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {isDifferentToolseller && (
                        <Alert variant="danger" className="d-flex justify-content-between align-items-center mb-3">
                            <span>
                                В корзине уже есть товары от другого продавца. Пожалуйста,
                                очистите корзину перед добавлением новых товаров.
                            </span>
                            <Button variant="outline-danger" onClick={clearCart}>
                                Очистить корзину
                            </Button>
                        </Alert>
                    )}

                    {filteredProducts && filteredProducts.length > 0 ? (
                        <Row className="products-row">
                            {filteredProducts.map((product) => (
                                <Col key={product.id} xs={12} sm={6} md={4} className="mb-4">
                                    <Card className="product-card h-100">
                                        {product.photo && (
                                            <Card.Img
                                                variant="top"
                                                src={`http://localhost:5000${product.photo}`}
                                                alt={product.name}
                                                className="product-img"
                                            />
                                        )}
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title className="product-title">{product.name}</Card.Title>
                                            <Card.Text className="product-description">{product.description}</Card.Text>
                                            <Card.Text className="product-price">
                                                <strong>Цена:</strong> {product.price} ₽
                                            </Card.Text>
                                            <Card.Text className="product-category">
                                                <strong>Категория:</strong> {product.category}
                                            </Card.Text>
                                            <Card.Text className="product-brand">
                                                <strong>Бренд:</strong> {product.brand}
                                            </Card.Text>
                                            {product.model && (
                                                <Card.Text className="product-model">
                                                    <strong>Модель:</strong> {product.model}
                                                </Card.Text>
                                            )}
                                            <Card.Text className="product-condition">
                                                <strong>Состояние:</strong> {product.condition}
                                            </Card.Text>
                                            {product.warranty && (
                                                <Card.Text className="product-warranty">
                                                    <strong>Гарантия:</strong> {product.warranty}
                                                </Card.Text>
                                            )}
                                            <Card.Text className="product-stock">
                                                <strong>В наличии:</strong> {product.stock}
                                            </Card.Text>
                                            {product.documentation && (
                                                <Button
                                                    variant="outline-info"
                                                    href={`http://localhost:5000${product.documentation}`}
                                                    download
                                                    className="mt-2"
                                                >
                                                    Скачать инструкцию
                                                </Button>
                                            )}
                                            {authData.isAuthenticated && (
                                                <>
                                                    <div className="d-flex align-items-center mb-2 add-to-cart-group">
                                                        <Form.Control
                                                            type="number"
                                                            min="1"
                                                            value={quantities[product.id] || 1}
                                                            onChange={(e) =>
                                                                handleQuantityChange(product.id, e.target.value)
                                                            }
                                                            className="quantity-input"
                                                        />
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={isDifferentToolseller}
                                                            className="ms-2 add-to-cart-btn"
                                                        >
                                                            Добавить в корзину
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => handleAddToCompare(product)}
                                                        className="compare-btn"
                                                    >
                                                        Добавить в сравнение
                                                    </Button>
                                                </>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <p className="no-products">Товары не найдены.</p>
                    )}

                    <h2 className="mt-4 section-title">Отзывы</h2>
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="review-item">
                                <hr />
                                <h6 className="review-header">
                                    {review.User?.firstName} {review.User?.lastName} оценил(а) на {review.rating} звезд
                                </h6>
                                <p className="review-short">
                                    <em>{review.shortReview}</em>
                                </p>
                                <p className="review-text">{review.reviewText}</p>
                                <small className="review-date">
                                    {new Date(review.createdAt).toLocaleString()}
                                </small>
                            </div>
                        ))
                    ) : (
                        <p className="no-reviews">Нет отзывов.</p>
                    )}
                </div>
            ) : (
                <p className="not-found">Продавец не найден.</p>
            )}

            {error && (
                <Alert variant="danger" className="mt-3 error-alert">
                    {error}
                </Alert>
            )}
        </Container>
    );
}

export default ToolsellerDetails;