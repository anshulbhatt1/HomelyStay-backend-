import { validationResult } from 'express-validator';
import Property from '../models/Property.js';

export const createProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const property = await Property.create({
      ...req.body,
      host: req.user._id,
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Create property error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProperties = async (req, res) => {
  try {
    const { city, country, minPrice, maxPrice } = req.query;

    const query = {};

    if (city) query.city = city;
    if (country) query.country = country;
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query).populate('host', 'name email');
    res.json(properties);
  } catch (error) {
    console.error('Get properties error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('host', 'name email');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own properties' });
    }

    Object.assign(property, req.body);
    await property.save();

    res.json(property);
  } catch (error) {
    console.error('Update property error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own properties' });
    }

    await property.deleteOne();

    res.json({ message: 'Property deleted' });
  } catch (error) {
    console.error('Delete property error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

