import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios
      .get('/properties')
      .then((res) => setProperties(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load properties'))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="grid">
      {properties.map((property) => (
        <article key={property._id} className="card property-card">
          {property.images?.[0] && (
            <div className="property-image">
              <img src={property.images[0]} alt={property.title} />
            </div>
          )}
          <div className="property-body">
            <h3>{property.title}</h3>
            <p className="muted">
              {property.city}, {property.country}
            </p>
            <p className="price">${property.pricePerNight} / night</p>
            <p className="truncate">{property.description}</p>
            <Link to={`/properties/${property._id}`} className="btn btn-small">
              View Details
            </Link>
          </div>
        </article>
      ))}
      {properties.length === 0 && (
        <div className="centered">
          <p>No properties found.</p>
        </div>
      )}
    </div>
  );
};

export default PropertyList;

