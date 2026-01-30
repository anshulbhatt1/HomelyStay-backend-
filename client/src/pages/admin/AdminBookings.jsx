import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    axios
      .get('/admin/bookings')
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id, propTitle) => {
    if (!window.confirm(`Delete booking for "${propTitle}"? This cannot be undone.`)) return;
    setDeleting(id);
    axios
      .delete(`/admin/bookings/${id}`)
      .then(() => {
        setBookings((prev) => prev.filter((b) => b._id !== id));
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Failed to delete booking');
      })
      .finally(() => setDeleting(null));
  };

  if (loading) {
    return (
      <div className="centered">
        <p>Loading bookings...</p>
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

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Booking Management</h1>
        <Link to="/admin" className="btn btn-outline btn-small">
          ← Dashboard
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Guest</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>
                  <span className="admin-cell-title">
                    {b.property?.title ?? '—'}
                  </span>
                </td>
                <td>
                  {b.user ? (
                    <span>
                      {b.user.name} ({b.user.email})
                    </span>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td>{b.checkIn ? new Date(b.checkIn).toLocaleDateString() : '—'}</td>
                <td>{b.checkOut ? new Date(b.checkOut).toLocaleDateString() : '—'}</td>
                <td>${b.totalPrice ?? 0}</td>
                <td>
                  <span className={`admin-badge admin-badge-${b.status}`}>
                    {b.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline btn-small admin-btn-danger"
                    disabled={deleting === b._id}
                    onClick={() =>
                      handleDelete(b._id, b.property?.title ?? 'booking')
                    }
                  >
                    {deleting === b._id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bookings.length === 0 && (
        <p className="muted">No bookings found.</p>
      )}
    </div>
  );
};

export default AdminBookings;
