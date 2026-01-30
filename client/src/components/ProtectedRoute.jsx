import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({
  requireHost = false,
  requireAdmin = false,
  requireUser = false,
}) => {
  const { isAuthenticated, loading, isHost, isAdmin, isUser } = useAuth();

  if (loading) {
    return (
      <div className="centered">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireHost && !isHost) {
    return <Navigate to="/" replace />;
  }

  if (requireUser && !isUser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/** Host-only routes: /host/dashboard, /host/add-property */
export const HostRoute = () => <ProtectedRoute requireHost />;

/** Admin-only routes: /admin/dashboard, etc. */
export const AdminRoute = () => <ProtectedRoute requireAdmin />;

/** User-only routes: /my-bookings */
export const UserRoute = () => <ProtectedRoute requireUser />;

export default ProtectedRoute;

