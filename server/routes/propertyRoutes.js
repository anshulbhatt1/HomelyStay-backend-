import express from 'express';
import { body } from 'express-validator';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProperties);
router.get('/:id', getPropertyById);

router.post(
  '/',
  protect,
  requireRole('host'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('pricePerNight').isNumeric().withMessage('Price per night must be a number'),
    body('maxGuests').optional().isInt({ min: 1 }).withMessage('Max guests must be at least 1'),
  ],
  createProperty
);

router.put('/:id', protect, requireRole('host'), updateProperty);

router.delete('/:id', protect, requireRole('host'), deleteProperty);

export default router;

