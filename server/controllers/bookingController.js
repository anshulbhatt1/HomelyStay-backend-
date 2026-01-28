import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

const getNightsBetween = (checkIn, checkOut) => {
  const msPerNight = 1000 * 60 * 60 * 24;
  const diffMs = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diffMs / msPerNight);
};

export const createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { propertyId, checkIn, checkOut } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ message: 'Invalid dates' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    // Optional availability window check
    if (property.availableFrom && checkInDate < property.availableFrom) {
      return res
        .status(400)
        .json({ message: 'Check-in is before property availability window' });
    }
    if (property.availableTo && checkOutDate > property.availableTo) {
      return res
        .status(400)
        .json({ message: 'Check-out is after property availability window' });
    }

    // Check for existing bookings that overlap the requested range
    // Overlap condition: existing.checkIn < newCheckOut && existing.checkOut > newCheckIn
    const conflictingBooking = await Booking.findOne({
      property: property._id,
      status: 'confirmed',
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (conflictingBooking) {
      return res
        .status(400)
        .json({ message: 'Property is already booked for the selected dates' });
    }

    const nights = getNightsBetween(checkInDate, checkOutDate);
    const totalPrice = nights * property.pricePerNight;

    const booking = await Booking.create({
      property: property._id,
      user: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
    });

    const populated = await booking.populate('property').populate('user', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create booking error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('property')
      .sort({ checkIn: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getHostBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'property',
        match: { host: req.user._id },
      })
      .populate('user', 'name email')
      .sort({ checkIn: -1 });

    // Filter out bookings whose property doesn't match host (due to match)
    const filtered = bookings.filter((b) => b.property);

    res.json(filtered);
  } catch (error) {
    console.error('Get host bookings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('property');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isUserOwner = booking.user.toString() === req.user._id.toString();
    const isHostOwner =
      booking.property && booking.property.host.toString() === req.user._id.toString();

    if (!isUserOwner && !isHostOwner) {
      return res.status(403).json({ message: 'You cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error('Cancel booking error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

