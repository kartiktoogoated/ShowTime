const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes.js'); 
const movieRoutes = require('./src/routes/movieRoutes.js'); // Import movie routes

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

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
app.use('/api/movies', movieRoutes); // Add route for movie management

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
