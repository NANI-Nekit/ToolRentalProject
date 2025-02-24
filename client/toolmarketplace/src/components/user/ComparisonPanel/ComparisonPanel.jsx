import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import './ComparisonPanel.css';

function ComparisonPanel({ items, onRemove, onAddToCart }) {
    const [open, setOpen] = useState(false);

    if (items.length === 0) return null;

    return (
        <div className="comparison-panel">
            <div className="d-flex justify-content-between align-items-center panel-header">
                <strong>Сравнение товаров</strong>
                <Button variant="secondary" size="sm" onClick={() => setOpen(!open)}>
                    {open ? 'Свернуть' : 'Развернуть'}
                </Button>
            </div>
            {open && (
                <div className="panel-body">
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Цена</th>
                                <th>Категория</th>
                                <th>Бренд</th>
                                <th>Модель</th>
                                <th>Состояние</th>
                                <th>Гарантия</th>
                                <th>В наличии</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.price} ₽</td>
                                    <td>{item.category}</td>
                                    <td>{item.brand}</td>
                                    <td>{item.model || '-'}</td>
                                    <td>{item.condition}</td>
                                    <td>{item.warranty || '-'}</td>
                                    <td>{item.stock}</td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => onAddToCart(item)}
                                        >
                                            В корзину
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => onRemove(item.id)}
                                            className="ms-1"
                                        >
                                            Удалить
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
}

export default ComparisonPanel;
