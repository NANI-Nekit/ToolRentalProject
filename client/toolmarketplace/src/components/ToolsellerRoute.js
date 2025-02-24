import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../redux context/AuthContext';
import { toast } from 'react-toastify';

const ToolsellerRoute = ({ children }) => {
    const { authData } = useContext(AuthContext);

    console.log('ToolsellerRoute: role is', authData.role, 'isAuthenticated:', authData.isAuthenticated);

    if (!authData.isAuthenticated) {
        toast.error('Для доступа к этому разделу необходимо войти в систему.');
        return <Navigate to="/login" />;
    }

    if (authData.role !== 'toolseller') {
        toast.error('У вас нет доступа к этому разделу.');
        return <Navigate to="/" />;
    }

    return children;
};

export default ToolsellerRoute;