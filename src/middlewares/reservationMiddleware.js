

const Reservation = require('../models/Reservation'); 
const Movie = require('../models/Movie'); 
const Showtime = require('../models/Showtime'); 

const checkReservationAvailability = async (req, res, next) => {
  const { showtimeId, reservedSeats } = req.body;

  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) {
    return res.status(404).json({ message: 'Showtime not found' });
  }

  // Check if requested seats are already taken
  const alreadyBooked = reservedSeats.some(seat => showtime.reservedSeats.includes(seat));
  if (alreadyBooked) {
    return res.status(400).json({ message: 'Some seats are already reserved' });
  }

  next();
};

const checkUpcomingReservation = async (req, res, next) => {
  const reservationId = req.params.reservationId;

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    return res.status(404).json({ message: 'Reservation not found' });
  }

  const showtime = await Showtime.findById(reservation.showtime);
  if (new Date(showtime.date) <= new Date()) {
    return res.status(400).json({ message: 'You can only cancel upcoming reservations' });
  }

  next();
};

const checkAdminReservationAccess = (req, res, next) => {

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admins only. Access Denied' });
  }
  next();
};

module.exports = { checkReservationAvailability, checkUpcomingReservation, checkAdminReservationAccess };

