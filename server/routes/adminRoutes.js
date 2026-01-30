import express from 'express';
import { body } from 'express-validator';
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getProperties,
  deleteProperty,
  getBookings,
  deleteBooking,
} from '../controllers/adminController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireRole('admin'));

router.get('/dashboard', getDashboardStats);

router.get('/users', getUsers);
router.put(
  '/users/:id/role',
  [body('role').isIn(['user', 'host', 'admin']).withMessage('Role must be user, host, or admin')],
  updateUserRole
);
router.delete('/users/:id', deleteUser);

router.get('/properties', getProperties);
router.delete('/properties/:id', deleteProperty);

router.get('/bookings', getBookings);
router.delete('/bookings/:id', deleteBooking);

export default router;
