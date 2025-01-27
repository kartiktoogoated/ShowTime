

const Reservation = require('../models/Reservation'); 
const Movie = require('../models/Movie'); 
const Showtime = require('../models/Showtime'); 

const checkReservationAvailability = async (req, res, next) => {
  const { movieId, showtimeId, date } = req.body;

  const movie = await Movie.findById(movieId);
  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) {
    return res.status(404).json({ message: 'Showtime not found' });
  }

  if (new Date(showtime.date).toDateString() !== new Date(date).toDateString()) {
    return res.status(400).json({ message: 'The selected date does not match the showtime date' });
  }

  const existingReservation = await Reservation.findOne({
    user: req.user._id,
    movie: movieId,
    showtime: showtimeId,
    date: date,
  });
  if (existingReservation) {
    return res.status(400).json({ message: 'You have already reserved a seat for this showtime' });
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

