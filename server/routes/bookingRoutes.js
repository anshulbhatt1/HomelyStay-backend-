import express from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  getMyBookings,
  getHostBookings,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/bookings
// Create a booking for the currently authenticated user
router.post(
  '/',
  protect,
  requireRole('user'),
  [
    body('propertyId').notEmpty().withMessage('Property ID is required'),
    body('checkIn').notEmpty().withMessage('Check-in date is required'),
    body('checkOut').notEmpty().withMessage('Check-out date is required'),
  ],
  createBooking
);

// GET /api/bookings/my
// Requirements use `/my` – keep `/me` as a backwards-compatible alias
router.get('/my', protect, requireRole('user'), getMyBookings);
router.get('/me', protect, requireRole('user'), getMyBookings);

// GET /api/bookings/host
router.get('/host', protect, requireRole('host'), getHostBookings);

// DELETE /api/bookings/:id
// Cancel a booking and free blocked dates
router.delete('/:id', protect, cancelBooking);
// Legacy alias still supported
router.patch('/:id/cancel', protect, cancelBooking);

export default router;

