import { validationResult } from 'express-validator';
import User from '../models/User.js';

// GET /api/users/me
// Return the currently authenticated user's profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/me
// Update the current user's profile (name/email)
export const updateCurrentUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof name === 'string') {
      user.name = name;
    }

    if (typeof email === 'string' && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Update current user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

