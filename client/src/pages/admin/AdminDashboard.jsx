import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="centered">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="centered">
        <p className="error">{error}</p>
      </div>
    );
  }

  const maxRevenue = Math.max(
    1,
    ...(stats.revenueByMonth || []).map((m) => m.total)
  );

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p className="muted">Overview of HomelyStay platform</p>

      <div className="admin-stats-grid">
        <Link to="/admin/users" className="admin-stat-card">
          <span className="admin-stat-value">{stats.totalUsers}</span>
          <span className="admin-stat-label">Total Users</span>
        </Link>
        <Link to="/admin/properties" className="admin-stat-card">
          <span className="admin-stat-value">{stats.totalProperties}</span>
          <span className="admin-stat-label">Total Properties</span>
        </Link>
        <Link to="/admin/bookings" className="admin-stat-card">
          <span className="admin-stat-value">{stats.totalBookings}</span>
          <span className="admin-stat-label">Total Bookings</span>
        </Link>
        <div className="admin-stat-card admin-stat-card-revenue">
          <span className="admin-stat-value">${Number(stats.revenue).toLocaleString()}</span>
          <span className="admin-stat-label">Revenue (confirmed)</span>
        </div>
      </div>

      <section className="admin-section">
        <h2>Revenue by month (last 6 months)</h2>
        {stats.revenueByMonth && stats.revenueByMonth.length > 0 ? (
          <div className="admin-chart">
            {stats.revenueByMonth.map((m) => (
              <div key={`${m.year}-${m.month}`} className="admin-chart-bar-wrap">
                <div
                  className="admin-chart-bar"
                  style={{
                    width: `${(m.total / maxRevenue) * 100}%`,
                  }}
                />
                <span className="admin-chart-label">
                  {new Date(m.year, m.month - 1).toLocaleString('default', {
                    month: 'short',
                    year: '2-digit',
                  })}
                </span>
                <span className="admin-chart-value">${m.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No revenue data for the last 6 months.</p>
        )}
      </section>

      <div className="admin-quick-links">
        <Link to="/admin/users" className="btn">
          Manage Users
        </Link>
        <Link to="/admin/properties" className="btn btn-outline">
          Manage Properties
        </Link>
        <Link to="/admin/bookings" className="btn btn-outline">
          Manage Bookings
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
