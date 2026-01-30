import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';

// GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProperties, totalBookings, revenueResult] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    const revenue = revenueResult[0]?.total ?? 0;

    // Last 6 months revenue per month for charts
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const revenueByMonth = await Booking.aggregate([
      { $match: { status: 'confirmed', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      totalUsers,
      totalProperties,
      totalBookings,
      revenue,
      revenueByMonth: revenueByMonth.map((r) => ({
        year: r._id.year,
        month: r._id.month,
        total: r.total,
        count: r.count,
      })),
    });
  } catch (error) {
    console.error('Admin dashboard error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const adminCount = await User.countDocuments({ role: 'admin' });
    if (user.role === 'admin' && adminCount <= 1) {
      return res.status(400).json({ message: 'Cannot change role: last admin must remain admin' });
    }

    user.role = role;
    await user.save();

    const updated = user.toJSON();
    delete updated.password;
    res.json(updated);
  } catch (error) {
    console.error('Admin update user role error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const adminCount = await User.countDocuments({ role: 'admin' });
    if (user.role === 'admin' && adminCount <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Admin delete user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/properties
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('host', 'name email role')
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    console.error('Admin get properties error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/properties/:id
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    await property.deleteOne();
    res.json({ message: 'Property deleted' });
  } catch (error) {
    console.error('Admin delete property error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('property')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Admin get bookings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/bookings/:id
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('property');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.property && Array.isArray(booking.property.bookedDates)) {
      const checkInTime = booking.checkIn.getTime();
      const checkOutTime = booking.checkOut.getTime();
      booking.property.bookedDates = booking.property.bookedDates.filter((range) => {
        const fromTime = new Date(range.from).getTime();
        const toTime = new Date(range.to).getTime();
        return !(fromTime === checkInTime && toTime === checkOutTime);
      });
      await booking.property.save();
    }

    await booking.deleteOne();
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    console.error('Admin delete booking error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
