import React from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PropertyList from './pages/PropertyList.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import MyBookings from './pages/MyBookings.jsx';
import HostDashboard from './pages/HostDashboard.jsx';
import AddProperty from './pages/AddProperty.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminProperties from './pages/admin/AdminProperties.jsx';
import AdminBookings from './pages/admin/AdminBookings.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

const App = () => {
  const { user, logout, isHost, isAdmin, isUser } = useAuth();
  const location = useLocation();
  const isAdminSection = isAdmin && location.pathname.startsWith('/admin');

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <Link to="/">HomelyStay</Link>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/properties">Properties</NavLink>
          {isUser && <NavLink to="/my-bookings">My Bookings</NavLink>}
          {isHost && <NavLink to="/host/dashboard">Host Dashboard</NavLink>}
          {isHost && <NavLink to="/host/add-property">Add Property</NavLink>}
          {isAdmin && <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>}
        </nav>
        <div className="auth">
          {user ? (
            <>
              <span className="user-label">
                {user.name} ({user.role})
              </span>
              <button type="button" className="btn btn-outline" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {isAdminSection && (
        <nav className="admin-subnav">
          <NavLink to="/admin/dashboard" end>Dashboard</NavLink>
          <NavLink to="/admin/users">Users</NavLink>
          <NavLink to="/admin/properties">Properties</NavLink>
          <NavLink to="/admin/bookings">Bookings</NavLink>
        </nav>
      )}

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />

          <Route element={<ProtectedRoute requireUser />}>
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>

          <Route path="/host" element={<ProtectedRoute requireHost />}>
            <Route index element={<Navigate to="/host/dashboard" replace />} />
            <Route path="dashboard" element={<HostDashboard />} />
            <Route path="add-property" element={<AddProperty />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute requireAdmin />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="bookings" element={<AdminBookings />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default App;

