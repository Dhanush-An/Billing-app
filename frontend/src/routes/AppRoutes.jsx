import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/LoadingSpinner';

const LoginPage = lazy(() => import('../pages/Login'));
const AdminDashboard = lazy(() => import('../pages/Dashboard'));
const UserDashboard = lazy(() => import('../pages/Billing'));
const InvoicePage = lazy(() => import('../pages/Invoice'));
const ThermalReceipt = lazy(() => import('../components/front-end/ThermalReceipt'));
const RegisterPage = lazy(() => import('../pages/Register'));

function ProtectedRoute({ children, requiredRole }) {
    const { currentUser } = useAuth();

    if (currentUser === undefined) {
        return <PageLoader />;
    }
    if (!currentUser) {
        return <Navigate to="/" replace />;
    }
    if (requiredRole && currentUser.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user"
                element={
                    <ProtectedRoute requiredRole="user">
                        <UserDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/invoice"
                element={
                    <ProtectedRoute requiredRole="user">
                        <InvoicePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/thermal-receipt"
                element={
                    <ProtectedRoute requiredRole="user">
                        <ThermalReceipt />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
