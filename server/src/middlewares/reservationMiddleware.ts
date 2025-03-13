import { Request, Response, NextFunction } from 'express';
import Reservation from '../models/Showtime';
import Showtime from '../models/Showtime';

export const checkReservationAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { showtimeId, reservedSeats } = req.body;

  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) {
    res.status(404).json({ message: 'Showtime not found' });
    return;
  }

  const alreadyBooked = reservedSeats.some((seat: number) =>
    showtime.reservedSeats.includes(seat)
  );
  if (alreadyBooked) {
    res.status(400).json({ message: 'Some seats are already reserved' });
    return;
  }

  next();
};

export const checkUpcomingReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const reservationId = req.params.reservationId;

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    res.status(404).json({ message: 'Reservation not found' });
    return;
  }

  const showtime = await Showtime.findById((reservation as any).showtime);
  if (!showtime || new Date(showtime.date) <= new Date()) {
    res.status(400).json({ message: 'You can only cancel upcoming reservations' });
    return;
  }

  next();
};

export const checkAdminReservationAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(req as any).user || (req as any).user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Admins only. Access Denied' });
    return;
  }
  next();
};
