import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkReservationAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { showtimeId, reservedSeats } = req.body;

  // Find the showtime by its ID
  const showtime = await prisma.showTime.findUnique({
    where: { id: showtimeId },
  });
  if (!showtime) {
    res.status(404).json({ message: 'Showtime not found' });
    return;
  }

  // Check if any of the seats in the request are already reserved
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
  const { reservationId } = req.params;

  // Find the reservation by its ID
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reservation) {
    res.status(404).json({ message: 'Reservation not found' });
    return;
  }

  // Find the showtime related to the reservation
  const showtime = await prisma.showTime.findUnique({
    where: { id: reservation.showtimeId },
  });
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
  // Assumes that the authentication middleware attaches the user object to req.user
  if (!(req as any).user || ((req as any).user.role as string).toLowerCase() !== 'admin') {
    res.status(403).json({ message: 'Admins only. Access Denied' });
    return;
  }
  next();
};
