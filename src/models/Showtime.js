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
    type: [Number],  
    default: [],
  },
});

const Showtime = mongoose.model('Showtime', showtimeSchema);

module.exports = Showtime;
