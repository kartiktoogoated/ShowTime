const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const morgan = require('morgan');  // Adding logging
const helmet = require('helmet');  // Adding security middleware

const authRoutes = require('./src/routes/authRoutes.js'); 
const movieRoutes = require('./src/routes/movieRoutes.js'); // Import movie routes
const reservationRoutes = require('./src/routes/reservationRoutes.js')

const app = express();
const PORT = process.env.PORT || 8080; // Default to 8080 if PORT is not set

// Middleware setup
app.use(express.json());
app.use(morgan('dev'));  // Log HTTP requests
app.use(helmet());  // Secure your app by setting HTTP headers

// MongoDB connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MongoDB URI is not defined in environment variables.");
    }
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Route setup
app.use('/api/auth', authRoutes); 
app.use('/api/movies', movieRoutes); 
app.use('/api/reservations', reservationRoutes);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log("Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
