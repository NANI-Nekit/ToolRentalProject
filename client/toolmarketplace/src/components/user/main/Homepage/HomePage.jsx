import React, { useEffect, useState, useCallback } from 'react';
import axios from '../../../../api/axiosConfig';
import { Link } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Form,
    InputGroup,
    Spinner,
    Alert,
    Pagination,
} from 'react-bootstrap';
import debounce from 'lodash.debounce';
import './HomePage.css';

// Функция для рендера рейтинга с звёздами
function renderRating(rating, reviewCount) {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <span className="rating-wrapper">
            {[...Array(fullStars)].map((_, i) => (
                <span key={`full-${i}`} className="text-warning">★</span>
            ))}
            {halfStar && <span className="text-warning">☆</span>}
            {[...Array(emptyStars)].map((_, i) => (
                <span key={`empty-${i}`} className="text-muted">★</span>
            ))}
            <span className="ms-2 rating-info">
                {(rating || 0).toFixed(1)} / 5 ({reviewCount || 0} отзывов)
            </span>
        </span>
    );
}

function HomePage() {
    const [toolsellers, setToolsellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState('');
    const [searchAddress, setSearchAddress] = useState('');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 9;
    const [error, setError] = useState(null);

    const debouncedFetchToolsellers = useCallback(
        debounce(() => {
            fetchToolsellers();
        }, 500),
        [searchName, searchAddress, ratingFilter, currentPage]
    );

    useEffect(() => {
        debouncedFetchToolsellers();
        return () => debouncedFetchToolsellers.cancel();
    }, [searchName, searchAddress, ratingFilter, currentPage, debouncedFetchToolsellers]);

    const fetchToolsellers = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                limit: itemsPerPage,
                offset: (currentPage - 1) * itemsPerPage,
            };
            if (searchName.trim()) params.name = searchName.trim();
            if (searchAddress.trim()) params.address = searchAddress.trim();
            if (ratingFilter > 0) params.averageRating = ratingFilter;
            const response = await axios.get('/api/toolsellers', { params });
            setToolsellers(response.data.toolsellers);
            setTotalPages(Math.ceil(response.data.total / itemsPerPage));
            setLoading(false);
        } catch (err) {
            console.error('Ошибка при получении списка продавцов:', err);
            setError('Не удалось загрузить список продавцов. Пожалуйста, попробуйте позже.');
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        setSearchName('');
        setSearchAddress('');
        setRatingFilter(0);
        setCurrentPage(1);
        fetchToolsellers();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <Container className="py-4 homepage-container">
            <h3 className="text-center mb-4 homepage-title">Продавцы</h3>

            {/* Фильтры */}
            <div className="filter-section mb-4">
                <Row>
                    <Col xs={12} sm={4}>
                        <Form.Group controlId="searchName" className="mb-2">
                            <Form.Label>Поиск по названию</Form.Label>
                            <InputGroup className="filter-input-group">
                                <InputGroup.Text>
                                    <i className="bi bi-search"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите название"
                                    value={searchName}
                                    onChange={(e) => {
                                        setSearchName(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={4}>
                        <Form.Group controlId="searchAddress" className="mb-2">
                            <Form.Label>Поиск по адресу</Form.Label>
                            <InputGroup className="filter-input-group">
                                <InputGroup.Text>
                                    <i className="bi bi-search"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите адрес"
                                    value={searchAddress}
                                    onChange={(e) => {
                                        setSearchAddress(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={4}>
                        <Form.Group controlId="ratingFilter" className="mb-2">
                            <Form.Label>Фильтр по рейтингу</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    placeholder="Рейтинг"
                                    value={ratingFilter}
                                    onChange={(e) => {
                                        setRatingFilter(parseFloat(e.target.value) || 0);
                                        setCurrentPage(1);
                                    }}
                                    style={{ width: '100px' }}
                                />
                                <span className="ms-2">
                                    {ratingFilter > 0 ? `${ratingFilter} звёзд и выше` : 'Все рейтинги'}
                                </span>
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
                <div className="text-end mt-2">
                    <Button variant="secondary" onClick={handleResetFilters} className="filter-reset-btn">
                        Сбросить
                    </Button>
                </div>
            </div>

            {/* Сообщение об ошибке */}
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            {/* Секция продавцов */}
            {loading ? (
                <div className="d-flex justify-content-center align-items-center spinner-wrapper">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Row>
                    {toolsellers.length > 0 ? (
                        toolsellers.map((toolseller) => (
                            <Col xs={12} sm={6} md={4} key={toolseller.id} className="mb-4">
                                <Card className="h-100 toolseller-card shadow-sm">
                                    {toolseller.logo ? (
                                        <Card.Img
                                            variant="top"
                                            src={`http://localhost:5000${toolseller.logo}`}
                                            alt={toolseller.name}
                                            className="toolseller-img"
                                        />
                                    ) : (
                                        <Card.Img
                                            variant="top"
                                            src="https://via.placeholder.com/400x200.png?text=No+Image"
                                            alt="No Image"
                                            className="toolseller-img"
                                        />
                                    )}
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="toolseller-title">{toolseller.name}</Card.Title>
                                        <Card.Text className="toolseller-description">{toolseller.description}</Card.Text>
                                        <Card.Text className="toolseller-address">Адрес: {toolseller.address}</Card.Text>
                                        <div className="mt-auto">{renderRating(parseFloat(toolseller.averageRating) || 0, toolseller.reviewCount || 0)}</div>
                                    </Card.Body>
                                    <Card.Footer className="text-center">
                                        <Button variant="primary" as={Link} to={`/toolsellers/${toolseller.id}`} className="toolseller-btn">
                                            Подробнее
                                        </Button>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col xs={12}>
                            <h6 className="text-center no-toolsellers">Продавцы не найдены.</h6>
                        </Col>
                    )}
                </Row>
            )}

            {/* Пагинация */}
            {toolsellers.length > 0 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination className="custom-pagination">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <Pagination.Item
                                key={index + 1}
                                active={index + 1 === currentPage}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </div>
            )}
        </Container>
    );
}

export default HomePage;