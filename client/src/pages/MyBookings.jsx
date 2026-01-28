import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios
      .get('/bookings/me')
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="grid">
      {bookings.map((booking) => (
        <article key={booking._id} className="card">
          <h3>{booking.property?.title}</h3>
          <p className="muted">
            {new Date(booking.checkIn).toLocaleDateString()} -{' '}
            {new Date(booking.checkOut).toLocaleDateString()}
          </p>
          <p className="price">Total: ${booking.totalPrice}</p>
          <p>Status: {booking.status}</p>
        </article>
      ))}
      {bookings.length === 0 && (
        <div className="centered">
          <p>You have no bookings yet.</p>
        </div>
      )}
    </div>
  );
};

export default MyBookings;

