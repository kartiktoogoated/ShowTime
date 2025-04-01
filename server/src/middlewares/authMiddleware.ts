import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, ReservationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    console.log('Decoded token:', decoded);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Augment request with user information
    (req as any).user = user;
    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user || user.role.toLowerCase() !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }
    next();
  } catch (error: any) {
    console.error('Authorization error:', error.message);
    res.status(500).json({ message: 'Error verifying admin status' });
  }
};

export const promoteToAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const userToPromote = await prisma.user.findUnique({ where: { id: userId } });

    if (!userToPromote) {
      res.status(404).json({ message: 'User to promote not found' });
      return;
    }

    if (userToPromote.role.toLowerCase() === 'admin') {
      res.status(400).json({ message: 'User is already an admin' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });

    res.status(200).json({ message: 'User successfully promoted to admin', user: updatedUser });
  } catch (error: any) {
    console.error('Error promoting user to admin:', error.message);
    res.status(500).json({ message: 'Error promoting user to admin' });
  }
};

export const checkReservationAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { showtimeId, reservedSeats } = req.body;
    const showtime = await prisma.showTime.findUnique({ where: { id: showtimeId } });
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const checkUpcomingReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reservationId = req.params.reservationId;
    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    const showtime = await prisma.showTime.findUnique({ where: { id: reservation.showtimeId } });
    if (!showtime || new Date(showtime.date) <= new Date()) {
      res.status(400).json({ message: 'You can only cancel upcoming reservations' });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const checkAdminReservationAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user;
  if (!user || user.role.toLowerCase() !== 'admin') {
    res.status(403).json({ message: 'Admins only. Access Denied' });
    return;
  }
  next();
};
