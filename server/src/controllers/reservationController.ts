import { Request, Response } from 'express';
import { PrismaClient, ReservationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const createReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, showtimeId, reservedSeats } = req.body;
    const userId = (req as any).user.id; // Make sure your auth middleware sets req.user

    // Find the showtime by its ID
    const showtime = await prisma.showTime.findUnique({ where: { id: showtimeId } });
    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    // Check if any of the requested seats are already reserved
    const alreadyBooked = reservedSeats.some((seat: number) =>
      showtime.reservedSeats.includes(seat)
    );
    if (alreadyBooked) {
      res.status(400).json({ message: 'One or more seats are already reserved' });
      return;
    }

    // Update the showtime: add new reserved seats
    const updatedReservedSeats = [...showtime.reservedSeats, ...reservedSeats];
    await prisma.showTime.update({
      where: { id: showtimeId },
      data: { reservedSeats: updatedReservedSeats },
    });

    // Create the reservation record
    const newReservation = await prisma.reservation.create({
      data: {
        userId,
        movieId,
        showtimeId,
        reservedSeats,
        status: ReservationStatus.reserved,
      },
    });

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: newReservation,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error creating reservation',
      error: error.message,
    });
  }
};

export const getUserReservations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const reservations = await prisma.reservation.findMany({
      where: { userId, status: 'reserved' },
      include: {
        movie: { select: { title: true, genre: true } },
        showtime: true,
      },
    });

    res.status(200).json(reservations);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching reservations',
      error: error.message,
    });
  }
};

export const cancelReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservationId = req.params.id;
    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    const showtime = await prisma.showTime.findUnique({ where: { id: reservation.showtimeId } });
    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    // Ensure the showtime is not in the past
    if (new Date(showtime.date) < new Date()) {
      res.status(400).json({ message: 'Cannot cancel past reservations' });
      return;
    }

    // Update reservation status to "cancelled"
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.cancelled },
    });

    // Remove the reserved seats from the showtime's reservedSeats array
    const updatedReservedSeats = showtime.reservedSeats.filter(
      (seat) => !reservation.reservedSeats.includes(seat)
    );
    await prisma.showTime.update({
      where: { id: showtime.id },
      data: { reservedSeats: updatedReservedSeats },
    });

    res.status(200).json({ message: 'Reservation cancelled successfully' });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error cancelling reservation',
      error: error.message,
    });
  }
};
