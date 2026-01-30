import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Property from './models/Property.js';
import Booking from './models/Booking.js';

dotenv.config();

const NUM_HOSTS = 3;
const NUM_USERS = 10;
const NUM_PROPERTIES = 20;
const NUM_BOOKINGS = 30;

const cities = [
  { city: 'New York', country: 'USA' },
  { city: 'San Francisco', country: 'USA' },
  { city: 'London', country: 'UK' },
  { city: 'Berlin', country: 'Germany' },
  { city: 'Paris', country: 'France' },
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Sydney', country: 'Australia' },
  { city: 'Toronto', country: 'Canada' },
];

const imagePool = [
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
  'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg',
  'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg',
  'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg',
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = (arr) => arr[randomInt(0, arr.length - 1)];

const createUsers = async () => {
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@homelystay.com',
    password: 'Password123!',
    role: 'admin',
  });

  const hosts = [];
  for (let i = 1; i <= NUM_HOSTS; i += 1) {
    const host = await User.create({
      name: `Host ${i}`,
      email: `host${i}@homelystay.com`,
      password: 'Password123!',
      role: 'host',
    });
    hosts.push(host);
  }

  const users = [];
  for (let i = 1; i <= NUM_USERS; i += 1) {
    const user = await User.create({
      name: `User ${i}`,
      email: `user${i}@homelystay.com`,
      password: 'Password123!',
      role: 'user',
    });
    users.push(user);
  }

  return { admin, hosts, users };
};

const createProperties = async (hosts) => {
  const properties = [];

  for (let i = 1; i <= NUM_PROPERTIES; i += 1) {
    const location = pickRandom(cities);
    const host = hosts[(i - 1) % hosts.length];
    const pricePerNight = randomInt(50, 300);

    const images = [];
    const numImages = randomInt(1, 3);
    for (let j = 0; j < numImages; j += 1) {
      images.push(pickRandom(imagePool));
    }

    const property = await Property.create({
      title: `Cozy Stay #${i} in ${location.city}`,
      description: `A lovely and comfortable property located in ${location.city}, ${location.country}. Perfect for both short and long stays.`,
      address: `${randomInt(10, 999)} Main Street`,
      city: location.city,
      country: location.country,
      pricePerNight,
      images,
      maxGuests: randomInt(1, 6),
      host: host._id,
    });

    properties.push(property);
  }

  return properties;
};

const createBookings = async (users, properties) => {
  const bookings = [];

  const today = new Date();

  let created = 0;
  let attempts = 0;

  while (created < NUM_BOOKINGS && attempts < NUM_BOOKINGS * 10) {
    attempts += 1;

    const user = pickRandom(users);
    const propertyIndex = randomInt(0, properties.length - 1);
    const property = properties[propertyIndex];

    const startOffsetDays = randomInt(1, 60);
    const nights = randomInt(2, 7);

    const checkIn = new Date(today);
    checkIn.setDate(checkIn.getDate() + startOffsetDays);

    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);

    // Ensure no overlap with already blocked dates for this property
    const ranges = property.bookedDates || [];
    const hasConflict = ranges.some((range) => {
      const from = new Date(range.from);
      const to = new Date(range.to);
      return from < checkOut && to > checkIn;
    });

    if (hasConflict) {
      // try another combination
      // eslint-disable-next-line no-continue
      continue;
    }

    const totalPrice = nights * property.pricePerNight;

    const booking = await Booking.create({
      property: property._id,
      user: user._id,
      checkIn,
      checkOut,
      totalPrice,
    });

    // Keep property availability in sync with booking logic
    property.bookedDates = property.bookedDates || [];
    property.bookedDates.push({ from: checkIn, to: checkOut });
    await property.save();

    bookings.push(booking);
    created += 1;
  }

  return bookings;
};

const clearDatabase = async () => {
  await Booking.deleteMany({});
  await Property.deleteMany({});
  await User.deleteMany({});
};

const seed = async () => {
  try {
    await connectDB();

    console.log('Connected to MongoDB. Clearing existing data...');
    await clearDatabase();

    console.log('Creating users (1 admin, 3 hosts, 10 users)...');
    const { admin, hosts, users } = await createUsers();

    console.log('Creating properties (assigned to hosts)...');
    const properties = await createProperties(hosts);

    console.log('Creating bookings (assigned to users, with non-overlapping dates)...');
    const bookings = await createBookings(users, properties);

    console.log('Seeding complete.');
    console.log(`Admin: ${admin.email}`);
    console.log(`Hosts: ${hosts.map((h) => h.email).join(', ')}`);
    console.log(`Users: ${users.length}`);
    console.log(`Properties: ${properties.length}`);
    console.log(`Bookings: ${bookings.length}`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

const run = async () => {
  const arg = process.argv[2];

  await connectDB();

  if (arg === '--clear') {
    console.log('Connected to MongoDB. Clearing all HomelyStay collections...');
    await clearDatabase();
    console.log('Database cleared.');
    process.exit(0);
  }

  await seed();
};

run();

