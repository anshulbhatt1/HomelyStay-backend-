import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [roleEdit, setRoleEdit] = useState({});

  useEffect(() => {
    axios
      .get('/admin/users')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setUpdating(userId);
    axios
      .put(`/admin/users/${userId}/role`, { role: newRole })
      .then((res) => {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? res.data : u))
        );
        setRoleEdit((prev) => ({ ...prev, [userId]: null }));
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Failed to update role');
      })
      .finally(() => setUpdating(null));
  };

  const handleDelete = (userId, email) => {
    if (!window.confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setDeleting(userId);
    axios
      .delete(`/admin/users/${userId}`)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Failed to delete user');
      })
      .finally(() => setDeleting(null));
  };

  if (loading) {
    return (
      <div className="centered">
        <p>Loading users...</p>
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
        <h1>User Management</h1>
        <Link to="/admin" className="btn btn-outline btn-small">
          ← Dashboard
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {roleEdit[u._id] !== undefined ? (
                    <select
                      value={roleEdit[u._id] ?? u.role}
                      onChange={(e) =>
                        setRoleEdit((prev) => ({
                          ...prev,
                          [u._id]: e.target.value,
                        }))
                      }
                      className="admin-select"
                    >
                      <option value="user">user</option>
                      <option value="host">host</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    <span className="admin-badge admin-badge-role">{u.role}</span>
                  )}
                  {roleEdit[u._id] !== undefined ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-small"
                        style={{ marginLeft: 8 }}
                        disabled={updating === u._id}
                        onClick={() =>
                          handleRoleChange(u._id, roleEdit[u._id] ?? u.role)
                        }
                      >
                        {updating === u._id ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-small"
                        style={{ marginLeft: 4 }}
                        onClick={() =>
                          setRoleEdit((prev) => {
                            const next = { ...prev };
                            delete next[u._id];
                            return next;
                          })
                        }
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      style={{ marginLeft: 8 }}
                      onClick={() =>
                        setRoleEdit((prev) => ({ ...prev, [u._id]: u.role }))
                      }
                    >
                      Edit
                    </button>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline btn-small admin-btn-danger"
                    disabled={deleting === u._id}
                    onClick={() => handleDelete(u._id, u.email)}
                  >
                    {deleting === u._id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <p className="muted">No users found.</p>
      )}
    </div>
  );
};

export default AdminUsers;
