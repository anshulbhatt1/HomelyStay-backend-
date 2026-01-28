import mongoose from 'mongoose';

const { Schema } = mongoose;

const propertySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    availableFrom: {
      type: Date,
    },
    availableTo: {
      type: Date,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Property = mongoose.model('Property', propertySchema);

export default Property;

