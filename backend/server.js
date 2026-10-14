const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // Added for file uploads
require("dotenv").config();

// 1. Import Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); // Import payment routes
const bookingRoutes = require("./routes/bookingRoutes"); // Import booking routes
const messageRoutes = require("./routes/supportRoutes"); // Import message routes

// 2. Initialize App (CRITICAL: This must be before app.use)
const app = express();

// 3. Middleware
app.use(express.json());
app.use(cors({
    origin: '*', 
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-rtb-fingerprint-id'],
    exposedHeaders: ['Content-Type', 'Authorization', 'x-rtb-fingerprint-id'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve images
app.use("/api/users", userRoutes);
app.use('/api/support', require('./routes/supportRoutes'));

// 4. Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/payments", paymentRoutes); // Now 'app' exists, so this works
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));

// 5. Connect to DB and Start Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));