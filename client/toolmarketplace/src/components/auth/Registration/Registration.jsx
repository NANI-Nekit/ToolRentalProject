import React, { useState } from 'react';
import axios from '../../../redux context/api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Registration.css';

function Registration() {
    // Обновлённое начальное состояние для пользователя
    const [role, setRole] = useState('user');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        // Для пользователя:
        firstName: '',
        lastName: '',
        phone: '',
        birthDate: '',
        description: '',
        address: '',
        // Для продавца:
        toolsellerName: '',
        contactPersonName: '',
        registrationNumber: '',
        toolsellerPhone: '',
        toolsellerDescription: '',
    });
    const [photo, setPhoto] = useState(null);
    const [photoUploaded, setPhotoUploaded] = useState(false);

    const navigate = useNavigate();

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        setPhotoUploaded(!!file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Пароли не совпадают');
            return;
        }

        const data = new FormData();

        if (role === 'user') {
            // Отправляем правильные ключи для пользователя
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('phone', formData.phone);
            data.append('birthDate', formData.birthDate);
            data.append('description', formData.description);
            data.append('address', formData.address);
        } else {
            data.append('companyName', formData.toolsellerName);
            data.append('contactPerson', formData.contactPersonName);
            data.append('registrationNumber', formData.registrationNumber);
            data.append('phone', formData.toolsellerPhone);
            data.append('description', formData.toolsellerDescription);
            data.append('address', formData.address);
        }
        data.append('email', formData.email);
        data.append('password', formData.password);

        if (photo) {
            data.append('photo', photo);
        }

        try {
            const url =
                role === 'user'
                    ? '/api/users/registration'
                    : '/api/toolsellers/registration';
            await axios.post(url, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Регистрация прошла успешно!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            toast.error('Ошибка при регистрации');
        }
    };

    return (
        <Container className="py-4 registration-container">
            <h4 className="mb-4 registration-title">Регистрация</h4>
            <ToastContainer />
            <Form onSubmit={handleSubmit} className="registration-form">
                <Form.Group controlId="roleSelect" className="mb-3">
                    <Form.Label>Я хочу зарегистрироваться как</Form.Label>
                    <Form.Select value={role} onChange={handleRoleChange} className="registration-select">
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
                        className="registration-input"
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
                        className="registration-input"
                    />
                </Form.Group>
                <Form.Group controlId="formConfirmPassword" className="mb-3">
                    <Form.Label>Подтвердите пароль</Form.Label>
                    <Form.Control
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Повторите пароль"
                        className="registration-input"
                    />
                </Form.Group>
                {role === 'user' ? (
                    <>
                        <Form.Group controlId="formFirstName" className="mb-3">
                            <Form.Label>Имя</Form.Label>
                            <Form.Control
                                name="firstName"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Введите имя"
                                className="registration-input"
                            />
                        </Form.Group>
                        <Form.Group controlId="formLastName" className="mb-3">
                            <Form.Label>Фамилия</Form.Label>
                            <Form.Control
                                name="lastName"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Введите фамилию"
                                className="registration-input"
                            />
                        </Form.Group>
                        <Form.Group controlId="formPhone" className="mb-3">
                            <Form.Label>Телефон</Form.Label>
                            <Form.Control
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Введите номер телефона"
                                className="registration-input"
                            />
                        </Form.Group>
                        <Form.Group controlId="formBirthDate" className="mb-3">
                            <Form.Label>Дата рождения</Form.Label>
                            <Form.Control
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                className="registration-input"
                            />
                        </Form.Group>
                        <Form.Group controlId="formAddress" className="mb-3">
                            <Form.Label>Адрес</Form.Label>
                            <Form.Control
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Введите адрес"
                                className="registration-input"
                            />
                        </Form.Group>
                        <Form.Group controlId="formDescription" className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Расскажите о себе"
                                className="registration-textarea"
                            />
                        </Form.Group>
                        <Form.Group controlId="formPhoto" className="mb-3">
                            <Form.Label>Фото</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                disabled={photoUploaded}
                                className="registration-input"
                            />
                            {photoUploaded && (
                                <div className="mt-2 text-success registration-photo-status">
                                    Фотография загружена
                                </div>
                            )}
                        </Form.Group>
                    </>
                ) : (
                    <>
                        <Form.Group controlId="formToolsellerName" className="mb-3">
                            <Form.Label>Название продавца</Form.Label>
                            <Form.Control
                                name="toolsellerName"
                                required
                                value={formData.toolsellerName}
                                onChange={handleChange}
                                placeholder="Введите название компании"
                                className="registration-input"
                            />
                        </Form.Group>
                        <Form.Group controlId="formContactPersonName" className="mb-3">
                            <Form.Label>Контактное лицо</Form.Label>
                            <Form.Control
                                name="contactPersonName"
                                required
                                value={formData.contactPersonName}
                                onChange={handleChange}
                                placeholder="Введите имя контактного лица"
                                className="registration-input"
                            />
                        </Form.Group>
                        <Form.Group controlId="formRegistrationNumber" className="mb-3">
                            <Form.Label>Регистрационный номер</Form.Label>
                            <Form.Control
                                name="registrationNumber"
                                required
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                placeholder="Введите регистрационный номер"
                                className="registration-input"
                            />
                        </Form.Group>
                        <Form.Group controlId="formToolsellerPhone" className="mb-3">
                            <Form.Label>Телефон</Form.Label>
                            <Form.Control
                                name="toolsellerPhone"
                                required
                                value={formData.toolsellerPhone}
                                onChange={handleChange}
                                placeholder="Введите номер телефона"
                                className="registration-input"
                            />
                        </Form.Group>
                        <Form.Group controlId="formAddress" className="mb-3">
                            <Form.Label>Адрес</Form.Label>
                            <Form.Control
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Введите адрес компании"
                                className="registration-input"
                            />
                        </Form.Group>
                        <Form.Group controlId="formToolsellerDescription" className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="toolsellerDescription"
                                value={formData.toolsellerDescription}
                                onChange={handleChange}
                                placeholder="Расскажите о компании"
                                className="registration-textarea"
                            />
                        </Form.Group>
                        <Form.Group controlId="formPhoto" className="mb-3">
                            <Form.Label>Фото</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                disabled={photoUploaded}
                                className="registration-input"
                            />
                            {photoUploaded && (
                                <div className="mt-2 text-success registration-photo-status">
                                    Фотография загружена
                                </div>
                            )}
                        </Form.Group>
                    </>
                )}
                <Button variant="primary" type="submit" className="registration-btn">
                    Зарегистрироваться
                </Button>
            </Form>
        </Container>
    );
}

export default Registration;