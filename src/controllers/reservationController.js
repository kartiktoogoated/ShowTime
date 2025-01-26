const Reservation = require('../models/reservationModel');
const Movie = require('../models/movieModel');
const User = require('../models/userModel'); // Assuming user model is defined

// Create a new reservation
const createReservation = async (req, res) => {
  try {
    const { movieId, showtime, reservedSeats } = req.body;
    const userId = req.user.id; // Get user ID from the authenticated user

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const newReservation = new Reservation({
      user: userId,
      movie: movieId,
      showtime,
      reservedSeats
    });

    await newReservation.save();
    res.status(201).json({ message: 'Reservation created', reservation: newReservation });
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
};

// Get all reservations for the authenticated user
const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const reservations = await Reservation.find({ user: userId, status: 'reserved' }).populate('movie');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
};

// Cancel a reservation
const cancelReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'Reservation already cancelled' });
    }

    reservation.status = 'cancelled';
    await reservation.save();
    res.status(200).json({ message: 'Reservation cancelled', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
  }
};

module.exports = {
  createReservation,
  getUserReservations,
  cancelReservation
};
