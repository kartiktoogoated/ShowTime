const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const morgan = require('morgan');
const helmet = require('helmet');

const authRoutes = require('./src/routes/authRoutes.js'); 
const movieRoutes = require('./src/routes/movieRoutes.js'); 
const reservationRoutes = require('./src/routes/reservationRoutes.js');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware setup
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet({ contentSecurityPolicy: false }));

// MongoDB connection
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MongoDB URI is not defined in environment variables.");
        }
        await mongoose.connect(uri);
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

// Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        console.log("Shutting down gracefully...");
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
        process.exit(0);
    } catch (error) {
        console.error("Error during shutdown:", error.message);
        process.exit(1);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
