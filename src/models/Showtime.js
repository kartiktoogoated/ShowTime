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
  totalSeats: {
    type: Number,
    required: true,
  },
  reservedSeats: {
    type: [Number],  // Array of seat numbers already booked
    default: [],
  },
});

const Showtime = mongoose.models.Showtime || mongoose.model('Showtime', showtimeSchema);

module.exports = Showtime;
