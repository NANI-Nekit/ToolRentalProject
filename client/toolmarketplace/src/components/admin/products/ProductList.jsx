import React, { useEffect, useState, useContext } from 'react';
import axios from '../../../api/axiosConfig';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { Container, ListGroup, Button, Card } from 'react-bootstrap';
import { FaPlusCircle, FaEdit, FaTrash } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function ProductList() {
    const { authData } = useContext(AuthContext);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`/api/products/toolseller/${authData.user.id}`);
            setProducts(response.data);
        } catch (error) {
            console.error('Ошибка при получении списка товаров:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                await axios.delete(`/api/products/${id}`);
                setProducts(products.filter((product) => product.id !== id));
            } catch (error) {
                console.error('Ошибка при удалении товара:', error);
            }
        }
    };

    // Функция для экспорта данных в Excel
    const exportToExcel = () => {
        const data = products.map((product) => ({
            'Название': product.name,
            'Описание': product.description,
            'Цена': product.price,
            'Категория': product.category,
            'Бренд': product.brand,
            'Модель': product.model || '',
            'Состояние': product.condition,
            'Гарантия': product.warranty || '',
            'Количество на складе': product.stock,
            'Продавец': product.Toolseller ? product.Toolseller.companyName : '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, 'products_report.xlsx');
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Управление товарами</h4>
                <div className="d-flex align-items-center">
                    <Button onClick={exportToExcel} variant="success" className="me-3">
                        Скачать Excel-отчёт
                    </Button>
                    <Button as={Link} to="/toolseller-admin/products/add" variant="primary">
                        <FaPlusCircle className="me-2" />
                        Добавить новый товар
                    </Button>
                </div>
            </div>
            <ListGroup>
                {products.map((product) => (
                    <React.Fragment key={product.id}>
                        <ListGroup.Item className="mb-3 p-3 border rounded">
                            <Card className="d-flex flex-row w-100">
                                {product.photo && (
                                    <Card.Img
                                        variant="top"
                                        src={`http://localhost:5000${product.photo}`}
                                        alt={product.name}
                                        style={{ width: '450px', objectFit: 'cover' }}
                                    />
                                )}
                                <div className="d-flex flex-column flex-grow-1">
                                    <Card.Body>
                                        <Card.Title>{product.name}</Card.Title>
                                        <Card.Text className="text-muted">{product.description}</Card.Text>
                                        <Card.Text>
                                            <strong>Цена:</strong> {product.price} ₽
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Категория:</strong> {product.category}
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Бренд:</strong> {product.brand}
                                        </Card.Text>
                                        {product.model && (
                                            <Card.Text>
                                                <strong>Модель:</strong> {product.model}
                                            </Card.Text>
                                        )}
                                        <Card.Text>
                                            <strong>Состояние:</strong> {product.condition}
                                        </Card.Text>
                                        {product.warranty && (
                                            <Card.Text>
                                                <strong>Гарантия:</strong> {product.warranty}
                                            </Card.Text>
                                        )}
                                        <Card.Text>
                                            <strong>Количество на складе:</strong> {product.stock}
                                        </Card.Text>
                                        {product.Toolseller && (
                                            <Card.Text>
                                                <strong>Продавец:</strong> {product.Toolseller.companyName}
                                            </Card.Text>
                                        )}
                                        {product.documentation && (
                                            <Button
                                                variant="info"
                                                href={`http://localhost:5000${product.documentation}`}
                                                download
                                                className="mt-2"
                                            >
                                                Скачать документацию
                                            </Button>
                                        )}
                                    </Card.Body>
                                    <div className="d-flex justify-content-end p-2">
                                        <Button
                                            as={Link}
                                            to={`/toolseller-admin/products/edit/${product.id}`}
                                            variant="outline-primary"
                                            className="me-2"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button variant="outline-danger" onClick={() => handleDelete(product.id)}>
                                            <FaTrash />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </ListGroup.Item>
                        <hr />
                    </React.Fragment>
                ))}
            </ListGroup>
        </Container>
    );
}

export default ProductList;