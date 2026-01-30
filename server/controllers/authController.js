import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

// Helper to generate a signed JWT token for a user
const generateToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
  };

  // Prefer JWT_SECRET from environment; fall back to a dev-only secret
  let jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret && process.env.NODE_ENV !== 'production') {
    jwtSecret = 'homelystay-dev-secret-change-me';
    console.warn('JWT_SECRET not set; using insecure development secret. Set JWT_SECRET in .env for production.');
  }

  if (!jwtSecret) {
    // In production we never want to continue without a real secret
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const expiresIn = process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || '7d';

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a0700a2d-0334-4895-9876-4246c84d9107', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'initial',
      hypothesisId: 'H5',
      location: 'server/controllers/authController.js:generateToken:before',
      message: 'About to generate JWT token',
      data: {
        hasUserId: !!user?._id,
        hasRole: !!user?.role,
        jwtSecretPresent: !!jwtSecret,
        expiresIn,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return jwt.sign(payload, jwtSecret, {
    expiresIn,
  });
};

// POST /api/auth/register
// Register a new user, hash password, and return JWT + public user info
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { name, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password, // hashed by User model pre-save hook
      role: role === 'host' ? 'host' : 'user',
    });

    const token = generateToken(user);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Register error:', error.message);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0700a2d-0334-4895-9876-4246c84d9107', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'initial',
        hypothesisId: 'H6',
        location: 'server/controllers/authController.js:register:error',
        message: 'Register handler error',
        data: {
          message: error.message,
          name: error.name,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return res.status(500).json({
      success: false,
      message: 'Server error while registering user',
    });
  }
};

// POST /api/auth/login
// Authenticate user and return JWT + public user info
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.json({
      success: true,
      message: 'Login successful',
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while logging in',
    });
  }
};

// GET /api/auth/me — JWT read by protect middleware; return full user including role
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error('GetMe error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
    });
  }
};

