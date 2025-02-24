// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Registration from './components/auth/Registration/Registration';
import Login from './components/auth/Login/Login';
import Dashboard from './components/Dashboard';
import HomePage from './components/user/main/Homepage/HomePage';
import ToolsellerDetails from './components/user/main/ToolsellerDetails/ToolsellerDetails';
import ToolsellerAdmin from './components/admin/ToolsellerAdmin';
import ToolsellerOrders from './components/admin/ToolsellerOrders';
import PrivateRoute from './components/PrivateRoute';
import ToolsellerRoute from './components/ToolsellerRoute';
import EditToolsellerInfo from './components/admin/EditToolsellerInfo';
import ProductList from './components/admin/products/ProductList';
import AddProduct from './components/admin/products/AddProduct';
import EditProduct from './components/admin/products/EditProduct';
import Cart from './components/user/Cart/Cart';
import Orders from './components/user/orders/Orders';
import Profile from './components/user/profile/Profile';
import NavigationBar from './components/NavigationBar/NavigationBar';
import { ToastContainer } from 'react-toastify';
import { Container } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import ComparisonPanel from './components/user/ComparisonPanel/ComparisonPanel';

// Обёртка для страницы сравнения (при необходимости можно расширить логику)
function ComparePage() {
  // В данном примере используем пустой список, но здесь можно передавать актуальные данные сравнения
  const dummyItems = []; // или получить из контекста/хранилища
  const handleRemove = (id) => {
    // Реализуйте удаление товара из сравнения
    console.log('Удалить товар с id:', id);
  };
  const handleAddToCart = (item) => {
    // Реализуйте добавление товара в корзину
    console.log('Добавить в корзину товар:', item);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Сравнение инструментов</h2>
      <ComparisonPanel
        items={dummyItems}
        onRemove={handleRemove}
        onAddToCart={handleAddToCart}
      />
    </Container>
  );
}

function App() {
  return (
    <>
      <NavigationBar />
      <Container className="py-4">
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/toolsellers/:id" element={<ToolsellerDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/toolseller-admin"
            element={
              <ToolsellerRoute>
                <ToolsellerAdmin />
              </ToolsellerRoute>
            }
          />
          <Route
            path="/toolseller-admin/edit"
            element={
              <ToolsellerRoute>
                <EditToolsellerInfo />
              </ToolsellerRoute>
            }
          />
          <Route
            path="/toolseller-admin/products"
            element={
              <ToolsellerRoute>
                <ProductList />
              </ToolsellerRoute>
            }
          />
          <Route
            path="/toolseller-admin/products/add"
            element={
              <ToolsellerRoute>
                <AddProduct />
              </ToolsellerRoute>
            }
          />
          <Route
            path="/toolseller-admin/products/edit/:id"
            element={
              <ToolsellerRoute>
                <EditProduct />
              </ToolsellerRoute>
            }
          />
          <Route
            path="/toolseller-admin/orders"
            element={
              <ToolsellerRoute>
                <ToolsellerOrders />
              </ToolsellerRoute>
            }
          />
          {/* Новый маршрут для страницы сравнения инструментов */}
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </Container>
      <ToastContainer />
    </>
  );
}

export default App;
