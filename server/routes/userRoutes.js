import express from 'express';
import { body } from 'express-validator';
import { getCurrentUser, updateCurrentUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', protect, getCurrentUser);

// PUT /api/users/me
router.put(
  '/me',
  protect,
  [
    body('name').optional().isString().trim().notEmpty().withMessage('Name must be a non-empty string'),
    body('email').optional().isEmail().withMessage('Email must be valid'),
  ],
  updateCurrentUser
);

export default router;

