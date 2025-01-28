const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
});

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  posterImage: {
    type: String,
    required: true,
  },
  showtimes: [showtimeSchema], // Array of showtimes
});

module.exports = mongoose.model('Movie', movieSchema);
