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

router.get('/me', protect, requireRole('user'), getMyBookings);

router.get('/host', protect, requireRole('host'), getHostBookings);

router.patch('/:id/cancel', protect, cancelBooking);

export default router;

