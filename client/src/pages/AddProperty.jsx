import React, { useState } from 'react';
import axios from 'axios';

const AddProperty = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    country: '',
    pricePerNight: '',
    maxGuests: 1,
    images: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description,
      address: form.address,
      city: form.city,
      country: form.country,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      images: form.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      await axios.post('/properties', payload);
      setSuccess('Property created successfully');
      setForm({
        title: '',
        description: '',
        address: '',
        city: '',
        country: '',
        pricePerNight: '',
        maxGuests: 1,
        images: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>Add a new property</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="title">
            Title
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="description">
            Description
            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="address">
            Address
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="city">
            City
            <input
              id="city"
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="country">
            Country
            <input
              id="country"
              name="country"
              type="text"
              value={form.country}
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="pricePerNight">
            Price per night (USD)
            <input
              id="pricePerNight"
              name="pricePerNight"
              type="number"
              min="0"
              value={form.pricePerNight}
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="maxGuests">
            Max guests
            <input
              id="maxGuests"
              name="maxGuests"
              type="number"
              min="1"
              value={form.maxGuests}
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="images">
            Image URLs (comma separated)
            <input
              id="images"
              name="images"
              type="text"
              value={form.images}
              onChange={handleChange}
            />
          </label>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Saving...' : 'Create property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;

