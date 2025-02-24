import React, { useState, useContext } from 'react';
import axios from '../../../redux context/api/axiosConfig';
import { AuthContext } from '../../../redux context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import './Login.css';

function Login() {
    const [role, setRole] = useState('user');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = role === 'user' ? '/api/users/login' : '/api/toolsellers/login';
            const response = await axios.post(url, formData);
            const token = response.data.token;
            const user = response.data.user;

            login({ user, token, role });

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', role);

            alert('Вход выполнен успешно!');
            if (role === 'user') {
                navigate('/');
            } else if (role === 'toolseller') {
                navigate('/toolseller-admin');
            }
        } catch (error) {
            console.error('Ошибка при входе:', error);
            alert('Ошибка при входе');
        }
    };

    return (
        <Container className="py-4 login-container">
            <h1 className="mb-4 login-title">Вход</h1>
            <Form onSubmit={handleSubmit} className="login-form">
                <Form.Group controlId="roleSelect" className="mb-3">
                    <Form.Label>Я вхожу как:</Form.Label>
                    <Form.Select value={role} onChange={handleRoleChange} className="login-select">
                        <option value="user">Покупатель</option>
                        <option value="toolseller">Продавец</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group controlId="formEmail" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Введите email"
                        className="login-input"
                    />
                </Form.Group>
                <Form.Group controlId="formPassword" className="mb-3">
                    <Form.Label>Пароль</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Введите пароль"
                        className="login-input"
                    />
                </Form.Group>
                <Button type="submit" variant="primary" className="login-btn">
                    Войти
                </Button>
            </Form>
        </Container>
    );
}

export default Login;