import React, { useState, useEffect, useContext } from 'react';
import axios from '../../../redux context/api/axiosConfig';
import { AuthContext } from '../../../redux context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Image } from 'react-bootstrap';

function EditProduct() {
    const { id } = useParams();
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        model: '',
        condition: 'new',
        warranty: '',
        stock: '',
    });
    const [photo, setPhoto] = useState(null);
    const [currentPhoto, setCurrentPhoto] = useState(null);

    useEffect(() => {
        fetchProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`/api/products/${id}`);
            const product = response.data;
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                brand: product.brand,
                model: product.model || '',
                condition: product.condition,
                warranty: product.warranty || '',
                stock: product.stock,
            });
            if (product.photo) {
                setCurrentPhoto(product.photo);
            }
        } catch (error) {
            console.error('Ошибка при получении информации о товаре:', error);
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
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('category', formData.category);
        data.append('brand', formData.brand);
        data.append('model', formData.model);
        data.append('condition', formData.condition);
        data.append('warranty', formData.warranty);
        data.append('stock', formData.stock);

        if (photo) {
            data.append('photo', photo);
        }

        try {
            await axios.put(`/api/products/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Товар успешно обновлен!');
            navigate('/bakery-admin/products');
        } catch (error) {
            console.error('Ошибка при обновлении товара:', error);
            alert('Ошибка при обновлении товара');
        }
    };

    return (
        <Container className="py-4">
            <h1 className="mb-4">Редактировать товар</h1>
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
                        required
                    >
                        <option value="new">Новое</option>
                        <option value="used">Б/У</option>
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
                    {currentPhoto && (
                        <div className="mb-2">
                            <Image
                                src={`http://localhost:5000${currentPhoto}`}
                                alt="Текущее фото"
                                thumbnail
                                style={{ maxWidth: '200px' }}
                            />
                        </div>
                    )}
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                    />
                </Form.Group>

                <Button type="submit" variant="primary">
                    Сохранить изменения
                </Button>
            </Form>
        </Container>
    );
}

export default EditProduct;
