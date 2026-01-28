import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const PropertyDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/properties/${id}`)
      .then((res) => setProperty(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load property'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setBookingLoading(true);
    try {
      await axios.post('/bookings', {
        propertyId: id,
        checkIn,
        checkOut,
      });
      setBookingSuccess('Booking created successfully!');
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="centered">
        <p>Loading property...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="centered">
        <p className="error">{error || 'Property not found'}</p>
      </div>
    );
  }

  return (
    <div className="property-details">
      <div className="property-details-main">
        {property.images?.length > 0 && (
          <div className="property-gallery">
            {property.images.map((url) => (
              <img key={url} src={url} alt={property.title} />
            ))}
          </div>
        )}
        <h1>{property.title}</h1>
        <p className="muted">
          {property.city}, {property.country}
        </p>
        <p>{property.description}</p>
      </div>
      <aside className="property-sidebar card">
        <p className="price-large">${property.pricePerNight} / night</p>
        {bookingError && <p className="error">{bookingError}</p>}
        {bookingSuccess && <p className="success">{bookingSuccess}</p>}

        {isAuthenticated ? (
          <form onSubmit={handleBook} className="form">
            <label htmlFor="checkIn">
              Check-in
              <input
                id="checkIn"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </label>
            <label htmlFor="checkOut">
              Check-out
              <input
                id="checkOut"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn" disabled={bookingLoading}>
              {bookingLoading ? 'Booking...' : 'Book now'}
            </button>
          </form>
        ) : (
          <p className="muted">Login to book this property.</p>
        )}
      </aside>
    </div>
  );
};

export default PropertyDetails;

