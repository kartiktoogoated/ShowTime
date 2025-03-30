import { Router, Request, Response } from 'express';
import Movie from '../models/Movie';
import Showtime from '../models/Showtime';
import Reservation from '../models/Reservation';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Get movies with showtimes for a given date
router.get('/movies/:date', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const showtimes = await Showtime.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    if (showtimes.length === 0) {
      res.status(404).json({ message: 'No movies found for the selected date' });
      return;
    }

    const movieIds = [...new Set(showtimes.map(st => st.movie.toString()))];
    const movies = await Movie.find({ _id: { $in: movieIds } }).lean();

    const moviesWithShowtimes = movies.map(movie => {
      const movieShowtimes = showtimes.filter(
        st => st.movie.toString() === movie._id.toString()
      );
      return { ...movie, showtimes: movieShowtimes };
    });

    res.status(200).json(moviesWithShowtimes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST route for reservations
router.post('/reserve', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, showtimeId, seats } = req.body;
    const userId = (req as any).user._id;

    if (!movieId || !showtimeId || !seats || seats.length === 0) {
      res.status(400).json({ message: 'Movie ID, Showtime ID, and seats are required' });
      return;
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    const existingReservation = await Reservation.findOne({
      userId,
      showtimeId,
      reservedSeats: { $in: seats }
    });

    if (existingReservation) {
      res.status(400).json({ message: 'You have already reserved one or more of these seats' });
      return;
    }

    const alreadyReserved = seats.some((seat: number) =>
      showtime.reservedSeats.includes(seat)
    );
    if (alreadyReserved) {
      res.status(400).json({ message: 'One or more seats are already reserved' });
      return;
    }

    if (seats.length > showtime.totalSeats - showtime.reservedSeats.length) {
      res.status(400).json({ message: 'Not enough seats available' });
      return;
    }

    showtime.reservedSeats.push(...seats);
    await showtime.save();

    const reservation = new Reservation({
      userId,
      movieId,
      showtimeId,
      reservedSeats: seats,
      status: 'reserved'
    });
    await reservation.save();

    res.status(201).json({ message: 'Reservation successful', reservation });
  } catch (error: any) {
    console.error('Error creating reservation:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// GET route to fetch reservations for the authenticated user
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const reservations = await Reservation.find({ userId, status: 'reserved' })
      .populate('movieId')
      .populate('showtimeId');

    if (!reservations.length) {
      res.status(404).json({ message: 'No reservations found for this user.' });
      return;
    }

    res.status(200).json(reservations);
  } catch (error: any) {
    console.error('Error fetching reservations:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// DELETE route to cancel a reservation
router.delete('/cancel/:reservationId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId);
    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    const showtime = await Showtime.findById(reservation.showtimeId);
    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    if (new Date(showtime.date) < new Date()) {
      res.status(400).json({ message: 'Cannot cancel past reservations' });
      return;
    }

    reservation.status = 'cancelled';
    await reservation.save();

    showtime.reservedSeats = showtime.reservedSeats.filter(
      (seat: number) => !reservation.reservedSeats.includes(seat)
    );
    await showtime.save();

    res.status(200).json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET route for admin to fetch reservation revenue report
router.get('/admin/reservations', authenticate, authorizeAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const reservations = await Reservation.find().populate('movieId showtimeId');

    if (!reservations.length) {
      res.status(200).json({ totalRevenue: 0, movieBreakdown: {} });
      return;
    }

    const report: { [key: string]: { revenue: number; totalSeatsReserved: number } } = {};
    let totalRevenue = 0;

    reservations.forEach(reservation => {
      if (!reservation.movieId || !reservation.showtimeId) return;
      const movieTitle = (reservation.movieId as any).title;
      const seatsReserved = reservation.reservedSeats.length;
      const revenue = seatsReserved * 10; // Assume price per seat is 10

      if (!report[movieTitle]) {
        report[movieTitle] = { revenue: 0, totalSeatsReserved: 0 };
      }
      report[movieTitle].revenue += revenue;
      report[movieTitle].totalSeatsReserved += seatsReserved;
      totalRevenue += revenue;
    });

    res.status(200).json({ totalRevenue, movieBreakdown: report });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
