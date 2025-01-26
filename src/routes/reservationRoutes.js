const express = require('express');
// const Movie = require('../models/Movie.js');
const Reservation = require('../models/Reservation.js');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware.js');
const router = express.Router();

// Get movies with showtimes for a specific date
router.get('/movies/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const formattedDate = new Date(date);

    const movies = await Movie.find({
      'showtimes.date': { $gte: formattedDate, $lt: new Date(formattedDate.setDate(formattedDate.getDate() + 1)) }
    });

    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reserve seats for a showtime
router.post('/reserve', authenticate, async (req, res) => {
  try {
    const { userId, movieId, showtimeId, seats } = req.body;

    const movie = await Movie.findById(movieId);
    const showtime = movie.showtimes.id(showtimeId);

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    if (seats.length > showtime.availableSeats) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    showtime.availableSeats -= seats.length;
    await movie.save();

    const reservation = new Reservation({
      userId,
      movieId,
      showtimeId,
      reservedSeats: seats,
    });

    await reservation.save();
    res.status(201).json({ message: 'Reservation successful', reservation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's reservations
router.get('/reservations', authenticate, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.userId, status: 'reserved' }).populate('movieId showtimeId');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel a reservation (only upcoming reservations)
router.delete('/cancel/:reservationId', authenticate, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const showtime = await Movie.findById(reservation.movieId)
      .then(movie => movie.showtimes.id(reservation.showtimeId));

    if (new Date(showtime.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel past reservations' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    // Restore available seats
    const movie = await Movie.findById(reservation.movieId);
    const showtimeIndex = movie.showtimes.findIndex(st => st._id.toString() === reservation.showtimeId);
    movie.showtimes[showtimeIndex].availableSeats += reservation.reservedSeats.length;
    await movie.save();

    res.status(200).json({ message: 'Reservation cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin - Get all reservations, capacity, and revenue
router.get('/admin/reservations', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('movieId showtimeId');
    const revenue = reservations.reduce((acc, reservation) => {
      return acc + reservation.reservedSeats.length * 10; // Assuming $10 per seat
    }, 0);

    res.status(200).json({ reservations, revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
