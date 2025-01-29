const express = require('express');
 const Movie = require('../models/Movie.js');
 const Showtime = require('../models/Showtime'); 

const Reservation = require('../models/Reservation.js');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware.js');
const router = express.Router();

router.get('/movies/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const showtimes = await Showtime.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).lean();

    if (showtimes.length === 0) {
      return res.status(404).json({ message: 'No movies found for the selected date' });
    }

    const movieIds = [...new Set(showtimes.map((st) => st.movie.toString()))];
    const movies = await Movie.find({ _id: { $in: movieIds } }).lean();

    const moviesWithShowtimes = movies.map((movie) => {
      const movieShowtimes = showtimes.filter((st) => st.movie.toString() === movie._id.toString());
      return {
        ...movie,
        showtimes: movieShowtimes,
      };
    });

    res.status(200).json(moviesWithShowtimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reserve', authenticate, async (req, res) => {
  try {
    const { movieId, showtimeId, seats } = req.body;
    const userId = req.user._id; 

    if (!movieId || !showtimeId || !seats || seats.length === 0) {
      return res.status(400).json({ message: 'Movie ID, Showtime ID, and seats are required' });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    const existingReservation = await Reservation.findOne({
      userId: req.user._id,
      showtimeId,
      reservedSeats: { $in: seats },
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'You have already reserved one or more of these seats' });
    }

    const alreadyReserved = seats.some(seat => showtime.reservedSeats.includes(seat));
    if (alreadyReserved) {
      return res.status(400).json({ message: 'One or more seats are already reserved' });
    }

    if (seats.length > showtime.totalSeats - showtime.reservedSeats.length) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    showtime.reservedSeats.push(...seats);
    await showtime.save();

    const reservation = new Reservation({
      userId,
      movieId,
      showtimeId,
      reservedSeats: seats,
      status: 'reserved',
    });

    await reservation.save();
    res.status(201).json({ message: 'Reservation successful', reservation });
  } catch (error) {
    console.error('Error creating reservation:', error.message);
    res.status(500).json({ message: error.message });
  }
});


router.get('/', authenticate, async (req, res) => {
  try {
    console.log("Authenticated User ID:", req.user._id); 

    const reservations = await Reservation.find({ userId: req.user._id, status: 'reserved' })
      .populate('movieId')
      .populate('showtimeId');

    console.log("Reservations Found:", reservations); 

    if (!reservations.length) {
      return res.status(404).json({ message: "No reservations found for this user." });
    }

    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error.message);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/cancel/:reservationId', authenticate, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const showtime = await Showtime.findById(reservation.showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    if (new Date(showtime.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel past reservations' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    showtime.reservedSeats = showtime.reservedSeats.filter(
      seat => !reservation.reservedSeats.includes(seat)
    );
    await showtime.save();

    res.status(200).json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/admin/reservations', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('movieId showtimeId');

    if (!reservations.length) {
      return res.status(200).json({ totalRevenue: 0, movieBreakdown: {} });
    }

    const report = {};
    let totalRevenue = 0;

    reservations.forEach(reservation => {
      if (!reservation.movieId || !reservation.showtimeId) return; 

      const movieTitle = reservation.movieId.title;
      const seatsReserved = reservation.reservedSeats.length;
      const revenue = seatsReserved * 10; 

      if (!report[movieTitle]) {
        report[movieTitle] = { revenue: 0, totalSeatsReserved: 0 };
      }

      report[movieTitle].revenue += revenue;
      report[movieTitle].totalSeatsReserved += seatsReserved;
      totalRevenue += revenue;
    });

    res.status(200).json({ totalRevenue, movieBreakdown: report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
