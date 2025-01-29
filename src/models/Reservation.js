const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true,
  },
  reservedSeats: {
    type: [Number],  // Array of seat numbers reserved
    required: true,
  },
  status: {
    type: String,
    enum: ['reserved', 'cancelled'],
    default: 'reserved',
  },
});

module.exports = mongoose.model('Reservation', reservationSchema);
