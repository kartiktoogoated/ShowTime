const Reservation = require('../models/Reservation');
const Movie = require('../models/Movie');

const createReservation = async (req, res) => {
  try {
    const { movieId, showtimeId, reservedSeats } = req.body;
    const userId = req.user._id;

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Check if requested seats are available
    const alreadyBooked = reservedSeats.some(seat => showtime.reservedSeats.includes(seat));
    if (alreadyBooked) {
      return res.status(400).json({ message: 'One or more seats are already reserved' });
    }

    // Reserve the seats
    showtime.reservedSeats.push(...reservedSeats);
    await showtime.save();

    // Create reservation
    const newReservation = new Reservation({
      userId,
      movieId,
      showtimeId,
      reservedSeats,
    });

    await newReservation.save();
    res.status(201).json({ message: 'Reservation created successfully', reservation: newReservation });
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
};

const getUserReservations = async (req, res) => {
  try {
    const userId = req.user._id;
    const reservations = await Reservation.find({ user: userId, status: 'reserved' })
      .populate('movie', 'title genre')
      .lean();

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const showtime = await Showtime.findById(reservation.showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Ensure reservation is not for a past showtime
    if (new Date(showtime.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel past reservations' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    // Release reserved seats
    showtime.reservedSeats = showtime.reservedSeats.filter(seat => !reservation.reservedSeats.includes(seat));
    await showtime.save();

    res.status(200).json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
  }
};


module.exports = {
  createReservation,
  getUserReservations,
  cancelReservation,
};
