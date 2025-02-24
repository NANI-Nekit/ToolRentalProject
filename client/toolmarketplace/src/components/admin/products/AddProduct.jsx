import React, { useState, useContext } from 'react';
import axios from '../../../redux context/api/axiosConfig';
import { AuthContext } from '../../../redux context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';

function AddProduct() {
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        model: '',          // Новое поле
        condition: 'new',   // Новое поле, по умолчанию "new"
        warranty: '',       // Новое поле
        stock: '',          // Новое поле
    });
    const [photo, setPhoto] = useState(null);
    const [documentation, setDocumentation] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleDocumentationChange = (e) => {
        setDocumentation(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        // Добавляем все поля из состояния в FormData
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });

        if (photo) {
            data.append('photo', photo);
        }
        if (documentation) {
            data.append('documentation', documentation);
        }

        try {
            await axios.post(`/api/products`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Товар успешно добавлен!');
            navigate('/toolseller-admin/products');
        } catch (error) {
            console.error('Ошибка при добавлении товара:', error);
            alert('Ошибка при добавлении товара');
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Добавить новый товар</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formProductName" className="mb-3">
                    <Form.Label>Название</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formProductDescription" className="mb-3">
                    <Form.Label>Описание</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formProductPrice" className="mb-3">
                    <Form.Label>Цена</Form.Label>
                    <Form.Control
                        type="number"
                        name="price"
                        required
                        value={formData.price}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formProductCategory" className="mb-3">
                    <Form.Label>Категория</Form.Label>
                    <Form.Control
                        type="text"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formProductBrand" className="mb-3">
                    <Form.Label>Бренд</Form.Label>
                    <Form.Control
                        type="text"
                        name="brand"
                        required
                        value={formData.brand}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formProductModel" className="mb-3">
                    <Form.Label>Модель</Form.Label>
                    <Form.Control
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formProductCondition" className="mb-3">
                    <Form.Label>Состояние</Form.Label>
                    <Form.Select
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                    >
                        <option value="new">Новое</option>
                        <option value="used">Б/у</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group controlId="formProductWarranty" className="mb-3">
                    <Form.Label>Гарантия</Form.Label>
                    <Form.Control
                        type="text"
                        name="warranty"
                        value={formData.warranty}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formProductStock" className="mb-3">
                    <Form.Label>Количество на складе</Form.Label>
                    <Form.Control
                        type="number"
                        name="stock"
                        required
                        value={formData.stock}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formProductPhoto" className="mb-3">
                    <Form.Label>Фото</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                    />
                </Form.Group>

                <Form.Group controlId="formProductDocumentation" className="mb-3">
                    <Form.Label>Инструкция (PDF или DOCX)</Form.Label>
                    <Form.Control
                        type="file"
                        accept=".pdf, .doc, .docx"
                        onChange={handleDocumentationChange}
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Добавить товар
                </Button>
            </Form>
        </Container>
    );
}

export default AddProduct;
