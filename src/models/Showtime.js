// src/models/Showtime.js
const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
});

const Showtime = mongoose.models.Showtime || mongoose.model('Showtime', showtimeSchema);

module.exports = Showtime;
