import React from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PropertyList from './pages/PropertyList.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import MyBookings from './pages/MyBookings.jsx';
import HostDashboard from './pages/HostDashboard.jsx';
import AddProperty from './pages/AddProperty.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

const App = () => {
  const { user, logout, isHost } = useAuth();

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
          {user && <NavLink to="/bookings">My Bookings</NavLink>}
          {isHost && <NavLink to="/host">Host Dashboard</NavLink>}
          {isHost && <NavLink to="/host/add-property">Add Property</NavLink>}
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

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/bookings" element={<MyBookings />} />
          </Route>

          <Route element={<ProtectedRoute requireHost />}>
            <Route path="/host" element={<HostDashboard />} />
            <Route path="/host/add-property" element={<AddProperty />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default App;

