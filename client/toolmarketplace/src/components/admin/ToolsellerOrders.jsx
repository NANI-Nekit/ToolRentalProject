import React, { useEffect, useState } from 'react';
import axios from '../../redux context/api/axiosConfig';
import { Container, Table, Button, Form, Spinner, Alert, Modal, Row, Col } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function ToolsellerOrders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchDate, setSearchDate] = useState('');
    const [searchStatus, setSearchStatus] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    // Список статусов для фильтрации (на английском, как на сервере)
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [searchDate, searchStatus, orders]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/toolsellers/orders');
            setOrders(response.data);
            setFilteredOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка при получении заказов:', err);
            setError('Не удалось загрузить заказы.');
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];
        if (searchDate) {
            filtered = filtered.filter(order =>
                new Date(order.orderDate).toISOString().startsWith(searchDate)
            );
        }
        if (searchStatus) {
            filtered = filtered.filter(order => order.status === searchStatus);
        }
        setFilteredOrders(filtered);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status: response.data.status } : order
                )
            );
            alert('Статус заказа успешно обновлён.');
        } catch (err) {
            console.error('Ошибка при обновлении статуса заказа:', err);
            alert('Не удалось обновить статус заказа.');
        }
    };

    const handleOpenDialog = (orderId) => {
        setOrderToDelete(orderId);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOrderToDelete(null);
    };

    const handleDeleteOrder = async () => {
        if (!orderToDelete) return;
        try {
            await axios.delete(`/api/orders/${orderToDelete}`);
            setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderToDelete));
            alert('Заказ успешно удалён.');
        } catch (err) {
            console.error('Ошибка при удалении заказа:', err);
            alert('Не удалось удалить заказ.');
        } finally {
            handleCloseDialog();
        }
    };

    // Функция для экспорта заказов в Excel
    const exportToExcel = () => {
        const data = filteredOrders.map((order) => {
            const buyer = order.User ? `${order.User.firstName} ${order.User.lastName} (${order.User.phone})` : '';
            const orderItems = order.OrderItems.map((item) =>
                `${item.Product.name} x ${item.quantity} = ${(item.priceAtPurchase * item.quantity).toFixed(2)} ₽`
            ).join('; ');
            return {
                'ID Заказа': order.id,
                'Адрес доставки': order.deliveryAddress,
                'Дата заказа': new Date(order.orderDate).toLocaleString(),
                'Статус': order.status,
                'Способ оплаты': order.paymentMethod,
                'Номер отслеживания': order.trackingNumber || '—',
                'Общая стоимость': order.totalCost + ' ₽',
                'Тип заказа': order.orderType === 'rental' ? 'Аренда' : 'Покупка',
                'Начало аренды': order.orderType === 'rental' && order.rentalStartDate
                    ? new Date(order.rentalStartDate).toLocaleDateString()
                    : '—',
                'Конец аренды': order.orderType === 'rental' && order.rentalEndDate
                    ? new Date(order.rentalEndDate).toLocaleDateString()
                    : '—',
                'Покупатель': buyer,
                'Товары': orderItems,
            };
        });
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказы');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, 'orders_report.xlsx');
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <h6 className="mt-3">Загрузка заказов...</h6>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h1 className="mb-4">Управление заказами</h1>

            {/* Фильтры */}
            <Row className="mb-3 g-3">
                <Col md={4}>
                    <Form.Group controlId="searchDate">
                        <Form.Label>Дата заказа</Form.Label>
                        <Form.Control
                            type="date"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="searchStatus">
                        <Form.Label>Статус</Form.Label>
                        <Form.Select
                            value={searchStatus}
                            onChange={(e) => setSearchStatus(e.target.value)}
                        >
                            <option value="">Все статусы</option>
                            {allowedStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                    <Button variant="outline-secondary" onClick={() => { setSearchDate(''); setSearchStatus(''); }}>
                        Сбросить фильтры
                    </Button>
                </Col>
            </Row>

            <Button variant="success" onClick={exportToExcel} className="mb-3">
                Скачать Excel-отчёт
            </Button>

            {filteredOrders.length === 0 ? (
                <Alert variant="info">Нет доступных заказов.</Alert>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID Заказа</th>
                            <th>Адрес доставки</th>
                            <th>Дата заказа</th>
                            <th>Статус</th>
                            <th>Способ оплаты</th>
                            <th>Номер отслеживания</th>
                            <th>Общая стоимость</th>
                            <th>Тип заказа</th>
                            <th>Начало аренды</th>
                            <th>Конец аренды</th>
                            <th>Покупатель</th>
                            <th>Товары</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.deliveryAddress}</td>
                                <td>{new Date(order.orderDate).toLocaleString()}</td>
                                <td>
                                    <Form.Select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    >
                                        {allowedStatuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </td>
                                <td>{order.paymentMethod}</td>
                                <td>{order.trackingNumber || '—'}</td>
                                <td>{order.totalCost} ₽</td>
                                <td>{order.orderType === 'rental' ? 'Аренда' : 'Покупка'}</td>
                                <td>
                                    {order.orderType === 'rental' && order.rentalStartDate
                                        ? new Date(order.rentalStartDate).toLocaleDateString()
                                        : '—'}
                                </td>
                                <td>
                                    {order.orderType === 'rental' && order.rentalEndDate
                                        ? new Date(order.rentalEndDate).toLocaleDateString()
                                        : '—'}
                                </td>
                                <td>
                                    {order.User?.firstName} {order.User?.lastName}
                                    <br />
                                    {order.User?.phone}
                                </td>
                                <td>
                                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                        {order.OrderItems.map((item) => (
                                            <li key={item.id}>
                                                {item.Product.name} x {item.quantity} ={' '}
                                                {(item.priceAtPurchase * item.quantity).toFixed(2)} ₽
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleOpenDialog(order.id)}
                                    >
                                        Удалить
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Modal show={openDialog} onHide={handleCloseDialog}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение удаления</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDialog}>
                        Отмена
                    </Button>
                    <Button variant="danger" onClick={handleDeleteOrder}>
                        Удалить
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ToolsellerOrders;