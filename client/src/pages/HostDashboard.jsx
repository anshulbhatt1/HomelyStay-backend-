import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const HostDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const userId = user._id || user.id;

    Promise.all([axios.get('/properties'), axios.get('/bookings/host')])
      .then(([propRes, bookRes]) => {
        setProperties(
          propRes.data.filter((p) => p.host && (p.host._id === userId || p.host.id === userId))
        );
        setBookings(bookRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load host data'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="centered">
        <p>Loading host dashboard...</p>
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
    <div className="host-dashboard">
      <section>
        <h2>Your properties</h2>
        <div className="grid">
          {properties.map((p) => (
            <article key={p._id} className="card">
              <h3>{p.title}</h3>
              <p className="muted">
                {p.city}, {p.country}
              </p>
              <p className="price">${p.pricePerNight} / night</p>
            </article>
          ))}
          {properties.length === 0 && (
            <p className="muted">You have not listed any properties yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2>Upcoming bookings</h2>
        <div className="grid">
          {bookings.map((b) => (
            <article key={b._id} className="card">
              <h3>{b.property?.title}</h3>
              <p>
                Guest: {b.user?.name} ({b.user?.email})
              </p>
              <p className="muted">
                {new Date(b.checkIn).toLocaleDateString()} -{' '}
                {new Date(b.checkOut).toLocaleDateString()}
              </p>
              <p className="price">Total: ${b.totalPrice}</p>
              <p>Status: {b.status}</p>
            </article>
          ))}
          {bookings.length === 0 && (
            <p className="muted">No bookings for your properties yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HostDashboard;

