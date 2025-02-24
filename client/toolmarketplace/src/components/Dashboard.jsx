import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Button } from 'react-bootstrap';

function Dashboard() {
    const { authData, logout } = useContext(AuthContext);

    return (
        <Container className="py-4 text-center">
            <h1 className="mb-3">Панель управления</h1>
            <p className="mb-3">
                Добро пожаловать, {authData.user ? (authData.user.name || authData.user.email) : 'Пользователь'}!
            </p>
            <Button variant="primary" onClick={logout}>
                Выйти
            </Button>
        </Container>
    );
}

export default Dashboard;
