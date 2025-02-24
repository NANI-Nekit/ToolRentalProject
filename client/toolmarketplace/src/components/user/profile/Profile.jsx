import React, { useEffect, useState, useContext } from 'react';
import axios from '../../../redux context/api/axiosConfig';
import { AuthContext } from '../../../redux context/AuthContext';
import { Container, Row, Col, Form, Button, Image, Spinner, Card } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCamera } from 'react-icons/fa';
import './Profile.css';

function Profile() {
    const { authData } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        description: '',
        address: '',
        photo: null,
        password: '',
    });

    useEffect(() => {
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get('/api/users/auth', {
                headers: { Authorization: `Bearer ${authData.token}` },
            });
            setUser(response.data);
            setFormData({
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                email: response.data.email || '',
                phone: response.data.phone || '',
                birthDate: response.data.birthDate ? response.data.birthDate.substring(0, 10) : '',
                description: response.data.description || '',
                address: response.data.address || '',
                photo: null,
                password: '',
            });
            setLoading(false);
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            toast.error('Не удалось загрузить данные профиля');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photo') {
            setFormData(prev => ({ ...prev, photo: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.firstName.trim() || !formData.email.trim()) {
            toast.error('Пожалуйста, заполните обязательные поля (Имя, Email)');
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('birthDate', formData.birthDate);
            data.append('description', formData.description);
            data.append('address', formData.address);
            if (formData.password) data.append('password', formData.password);
            if (formData.photo) data.append('photo', formData.photo);

            const response = await axios.put(`/api/users/${user.id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            setUser(response.data);
            toast.success('Профиль успешно обновлён');
            // Сбросим поля, не влияющие на остальные значения
            setFormData(prev => ({ ...prev, password: '', photo: null }));
            setSubmitting(false);
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            toast.error(error.response?.data?.message || 'Не удалось обновить профиль');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center profile-loading">
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <Container className="py-5 profile-container">
            <ToastContainer />
            <Card className="profile-card shadow-sm">
                <Card.Body>
                    <h2 className="mb-4 text-center profile-title">Профиль пользователя</h2>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-4">
                            <Col xs={12} className="text-center">
                                <div className="profile-image-wrapper">
                                    <Image
                                        src={
                                            formData.photo
                                                ? URL.createObjectURL(formData.photo)
                                                : `http://localhost:5000${user.photo}`
                                        }
                                        alt="Фото профиля"
                                        roundedCircle
                                        className="profile-image"
                                    />
                                    <Form.Label className="profile-image-edit">
                                        <FaCamera size={24} />
                                        <Form.Control
                                            type="file"
                                            name="photo"
                                            accept="image/*"
                                            onChange={handleChange}
                                            hidden
                                        />
                                    </Form.Label>
                                </div>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={12} md={6}>
                                <Form.Group controlId="formFirstName">
                                    <Form.Label>Имя*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="profile-input"
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group controlId="formLastName">
                                    <Form.Label>Фамилия</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="profile-input"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={12}>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Электронная почта*</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="profile-input"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={12} md={6}>
                                <Form.Group controlId="formPhone">
                                    <Form.Label>Телефон</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="profile-input"
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group controlId="formBirthDate">
                                    <Form.Label>Дата рождения</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className="profile-input"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={12}>
                                <Form.Group controlId="formAddress">
                                    <Form.Label>Адрес</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="profile-input"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={12}>
                                <Form.Group controlId="formDescription">
                                    <Form.Label>Описание</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="profile-textarea"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={12}>
                                <Form.Group controlId="formPassword">
                                    <Form.Label>Новый пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Оставьте пустым, если не хотите менять пароль"
                                        className="profile-input"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button variant="success" type="submit" disabled={submitting} className="w-100 profile-submit-btn">
                            {submitting ? 'Обновление...' : 'Обновить профиль'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Profile;