import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/front-end/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { PageLoader } from './components/ui/LoadingSpinner';

const LoginPage = lazy(() => import('./components/front-end/Login'));
const AdminDashboard = lazy(() => import('./components/back-end/Admin'));
const UserDashboard = lazy(() => import('./components/front-end/Cashier'));
const InvoicePage = lazy(() => import('./invoice'));
const ThermalReceipt = lazy(() => import('./components/front-end/ThermalReceipt'));
const RegisterPage = lazy(() => import('./components/front-end/Register'));

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

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppDataProvider>
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </AppDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
