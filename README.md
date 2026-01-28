## HomelyStay Backend

Node.js + Express + MongoDB backend for the HomelyStay house rental app.

### Features

- JWT authentication
- Bcrypt password hashing
- User roles: `user`, `host`
- CRUD for properties
- Booking system with date conflict prevention
- MongoDB with Mongoose
- Auth middleware protecting private routes

### Project Structure

```text
server/
  config/db.js
  models/User.js
  models/Property.js
  models/Booking.js
  controllers/authController.js
  controllers/propertyController.js
  controllers/bookingController.js
  routes/authRoutes.js
  routes/propertyRoutes.js
  routes/bookingRoutes.js
  middleware/authMiddleware.js
  index.js
```

### Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```bash
MONGODB_URI=mongodb://localhost:27017/homelystay
JWT_SECRET=supersecretjwtkey
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
```

3. Run the development server:

```bash
npm run dev
```

The server will start on `http://localhost:5000` by default.

# HomelyStay-backend-
