import mongoose from 'mongoose';

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure checkOut is after checkIn
bookingSchema.pre('validate', function (next) {
  if (this.checkIn && this.checkOut && this.checkOut <= this.checkIn) {
    return next(new Error('Check-out date must be after check-in date.'));
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

