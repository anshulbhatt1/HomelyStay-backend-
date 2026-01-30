import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    axios
      .get('/admin/properties')
      .then((res) => setProperties(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load properties'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id, title) => {
    if (!window.confirm(`Delete property "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    axios
      .delete(`/admin/properties/${id}`)
      .then(() => {
        setProperties((prev) => prev.filter((p) => p._id !== id));
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Failed to delete property');
      })
      .finally(() => setDeleting(null));
  };

  if (loading) {
    return (
      <div className="centered">
        <p>Loading properties...</p>
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
        <h1>Property Management</h1>
        <Link to="/admin" className="btn btn-outline btn-small">
          ← Dashboard
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Price/night</th>
              <th>Host</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p._id}>
                <td>
                  <span className="admin-cell-title">{p.title}</span>
                </td>
                <td>
                  {p.city}, {p.country}
                </td>
                <td>${p.pricePerNight}</td>
                <td>
                  {p.host ? (
                    <span>
                      {p.host.name} ({p.host.email})
                    </span>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline btn-small admin-btn-danger"
                    disabled={deleting === p._id}
                    onClick={() => handleDelete(p._id, p.title)}
                  >
                    {deleting === p._id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {properties.length === 0 && (
        <p className="muted">No properties found.</p>
      )}
    </div>
  );
};

export default AdminProperties;
