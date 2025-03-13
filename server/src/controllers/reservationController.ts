import { Request, Response } from 'express';
import Reservation from '../models/Reservation';
import Showtime from '../models/Showtime';

export const createReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, showtimeId, reservedSeats } = req.body;
    const userId = (req as any).user._id;

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    // Check if requested seats are available
    const alreadyBooked = reservedSeats.some((seat: number) =>
      showtime.reservedSeats.includes(seat)
    );
    if (alreadyBooked) {
      res.status(400).json({ message: 'One or more seats are already reserved' });
      return;
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
    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: newReservation,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
};

export const getUserReservations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const reservations = await Reservation.find({ user: userId, status: 'reserved' })
      .populate('movie', 'title genre')
      .lean();

    res.status(200).json(reservations);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
};

export const cancelReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    const showtime = await Showtime.findById(reservation.showtimeId);
    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    // Ensure reservation is not for a past showtime
    if (new Date(showtime.date) < new Date()) {
      res.status(400).json({ message: 'Cannot cancel past reservations' });
      return;
    }

    reservation.status = 'cancelled';
    await reservation.save();

    // Release reserved seats
    showtime.reservedSeats = showtime.reservedSeats.filter(
      (seat: number) => !reservation.reservedSeats.includes(seat)
    );
    await showtime.save();

    res.status(200).json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error: any) {
    res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
  }
};
