import React, { useState, useEffect, useContext } from 'react';
import axios from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import { Container, Form, Button, Image } from 'react-bootstrap';

function EditToolsellerInfo() {
    const { authData } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        registrationNumber: '',
        phone: '',
        address: '',
        establishedYear: '',
        description: '',
    });
    const [photo, setPhoto] = useState(null);
    const [currentPhoto, setCurrentPhoto] = useState(null);

    useEffect(() => {
        fetchToolsellerInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchToolsellerInfo = async () => {
        try {
            const response = await axios.get(`/api/toolsellers/${authData.user.id}`);
            const data = response.data;
            setFormData({
                companyName: data.companyName || '',
                contactPerson: data.contactPerson || '',
                registrationNumber: data.registrationNumber || '',
                phone: data.phone || '',
                address: data.address || '',
                establishedYear: data.establishedYear || '',
                description: data.description || '',
            });
            setCurrentPhoto(data.logo);
        } catch (error) {
            console.error('Ошибка при получении информации о продавце:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('companyName', formData.companyName);
        data.append('contactPerson', formData.contactPerson);
        data.append('registrationNumber', formData.registrationNumber);
        data.append('phone', formData.phone);
        data.append('address', formData.address);
        data.append('establishedYear', formData.establishedYear);
        data.append('description', formData.description);

        if (photo) {
            data.append('photo', photo);
        }

        try {
            const response = await axios.put(`/api/toolsellers/${authData.user.id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Информация успешно обновлена!');
            if (response.data.logo) {
                setCurrentPhoto(response.data.logo);
            }
        } catch (error) {
            console.error('Ошибка при обновлении информации о продавце:', error);
            alert('Ошибка при обновлении информации');
        }
    };

    return (
        <Container className="py-4">
            <h1 className="mb-4">Редактировать информацию о продавце</h1>
            {currentPhoto && (
                <div className="mb-4">
                    <p>Текущая фотография:</p>
                    <Image
                        src={`http://localhost:5000${currentPhoto}`}
                        alt={formData.companyName}
                        fluid
                        style={{ maxWidth: '200px' }}
                    />
                </div>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formToolsellerCompanyName" className="mb-3">
                    <Form.Label>Название компании</Form.Label>
                    <Form.Control
                        type="text"
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="formContactPerson" className="mb-3">
                    <Form.Label>Контактное лицо</Form.Label>
                    <Form.Control
                        type="text"
                        name="contactPerson"
                        required
                        value={formData.contactPerson}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="formRegistrationNumber" className="mb-3">
                    <Form.Label>Регистрационный номер</Form.Label>
                    <Form.Control
                        type="text"
                        name="registrationNumber"
                        required
                        value={formData.registrationNumber}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="formPhone" className="mb-3">
                    <Form.Label>Телефон</Form.Label>
                    <Form.Control
                        type="text"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="formAddress" className="mb-3">
                    <Form.Label>Адрес</Form.Label>
                    <Form.Control
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="formEstablishedYear" className="mb-3">
                    <Form.Label>Год основания</Form.Label>
                    <Form.Control
                        type="number"
                        name="establishedYear"
                        required
                        value={formData.establishedYear}
                        onChange={handleChange}
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
                    />
                </Form.Group>
                <Form.Group controlId="formPhoto" className="mb-3">
                    <Form.Label>Фото</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handlePhotoChange} />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Сохранить изменения
                </Button>
            </Form>
        </Container>
    );
}

export default EditToolsellerInfo;
