import dotenv from "dotenv";
import path from "path";

// Load environment variables from project root (where npm run dev is executed)
dotenv.config({ path: path.join(process.cwd(), ".env") });

import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "HomelyStay API is running" });
});

// 404 handler
app.use((req, res) => {
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/a0700a2d-0334-4895-9876-4246c84d9107", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "debug-session",
      runId: "routes",
      hypothesisId: "R1",
      location: "server/index.js:404",
      message: "Route not found handler hit",
      data: {
        method: req.method,
        path: req.originalUrl || req.url,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log("Mongo URI set:", !!mongoUri);

    await connectDB();

    app.listen(PORT, () => {
      console.log(`HomelyStay server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
