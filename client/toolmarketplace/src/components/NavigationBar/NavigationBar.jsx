import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import './NavigationBar.css';

const NavigationBar = () => {
    const { authData, logout } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Используем тот же эндпоинт, что и в компоненте Profile
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

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
            <Container>
                <Navbar.Brand as={Link} to="/" className="brand-logo">
                    Tool Marketplace
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggle" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {authData.role === 'user' && (
                            <>
                                <Navbar.Text className="ms-3 custom-nav-link">
                                    Баллы: {userData?.points || 0}
                                </Navbar.Text>
                                <Nav.Link as={Link} to="/orders" className="custom-nav-link">Мои заказы</Nav.Link>
                                <Nav.Link as={Link} to="/" className="custom-nav-link">Главная</Nav.Link>
                                <Nav.Link as={Link} to="/cart" className="custom-nav-link">Корзина</Nav.Link>
                            </>
                        )}
                        {authData.role === 'toolseller' && (
                            <Nav.Link as={Link} to="/toolseller-admin" className="custom-nav-link">Админка продавца</Nav.Link>
                        )}
                        {authData.role === 'user' && (
                            <Nav.Link as={Link} to="/profile" className="custom-nav-link">Профиль</Nav.Link>
                        )}
                    </Nav>
                    <Nav>
                        {!authData.isAuthenticated ? (
                            <>
                                <Nav.Link as={Link} to="/register" className="custom-nav-link">Регистрация</Nav.Link>
                                <Nav.Link as={Link} to="/login" className="custom-nav-link">Вход</Nav.Link>
                            </>
                        ) : (
                            <Button variant="outline-light" onClick={handleLogout} className="logout-btn">
                                Выход
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;
