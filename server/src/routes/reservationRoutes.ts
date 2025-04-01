import { Router, Request, Response } from "express";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware";
import { PrismaClient, ReservationStatus } from "@prisma/client";

const prisma = new PrismaClient();
const reservationRouter = Router();

/**
 * GET /api/reservations/movies/:date
 * Fetches all movies with showtimes on a given date.
 */
reservationRouter.get(
  "/movies/:date",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.params;
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // 1. Find showtimes in that date range
      const showtimes = await prisma.showTime.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (showtimes.length === 0) {
        res
          .status(404)
          .json({ message: "No movies found for the selected date" });
        return; // <-- Return here so we don't continue
      }

      // 2. Extract unique movieIds
      const movieIds = Array.from(new Set(showtimes.map((st) => st.movieId)));

      // 3. Fetch the movies
      const movies = await prisma.movie.findMany({
        where: { id: { in: movieIds } },
      });

      // 4. Attach showtimes to each movie
      const moviesWithShowtimes = movies.map((movie) => {
        const movieShowtimes = showtimes.filter(
          (st) => st.movieId === movie.id
        );
        return { ...movie, showtimes: movieShowtimes };
      });

      res.status(200).json(moviesWithShowtimes);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * POST /api/reservations/reserve
 * Creates a reservation for the authenticated user.
 */
reservationRouter.post(
  "/reserve",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { movieId, showtimeId, seats } = req.body;
      const userId = (req as any).user.id; // or however your user ID is stored

      if (!movieId || !showtimeId || !seats || seats.length === 0) {
        res.status(400).json({
          message: "Movie ID, Showtime ID, and seats are required",
        });
        return; // <-- Return to stop execution
      }

      // 1. Find the showtime
      const showtime = await prisma.showTime.findUnique({
        where: { id: showtimeId },
      });
      if (!showtime) {
        res.status(404).json({ message: "Showtime not found" });
        return;
      }

      // 2. Check if user already reserved any of these seats
      const conflictReservation = await prisma.reservation.findFirst({
        where: {
          userId,
          showtimeId,
          reservedSeats: {
            hasSome: seats, // "hasSome" checks for overlap
          },
        },
      });
      if (conflictReservation) {
        res
          .status(400)
          .json({
            message: "You have already reserved one or more of these seats",
          });
        return;
      }

      // 3. Check if seats are already reserved
      const alreadyReserved = seats.some((seat: number) =>
        showtime.reservedSeats.includes(seat)
      );
      if (alreadyReserved) {
        res
          .status(400)
          .json({ message: "One or more seats are already reserved" });
        return;
      }

      // 4. Check if enough seats are available
      const availableCount =
        showtime.totalSeats - showtime.reservedSeats.length;
      if (seats.length > availableCount) {
        res.status(400).json({ message: "Not enough seats available" });
        return;
      }

      // 5. Update the showtime's reservedSeats
      const updatedReservedSeats = [...showtime.reservedSeats, ...seats];
      await prisma.showTime.update({
        where: { id: showtimeId },
        data: { reservedSeats: updatedReservedSeats },
      });

      // 6. Create the reservation
      const reservation = await prisma.reservation.create({
        data: {
          userId,
          movieId,
          showtimeId,
          reservedSeats: seats,
          status: ReservationStatus.reserved,
        },
      });

      res.status(201).json({ message: "Reservation successful", reservation });
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * GET /api/reservations/
 * Fetch reservations for the authenticated user.
 */
reservationRouter.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const reservations = await prisma.reservation.findMany({
        where: {
          userId,
          status: "reserved",
        },
        include: {
          movie: true,
          showtime: true,
        },
      });

      if (reservations.length === 0) {
        res
          .status(404)
          .json({ message: "No reservations found for this user." });
        return;
      }

      res.status(200).json(reservations);
    } catch (error: any) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * DELETE /api/reservations/cancel/:reservationId
 * Cancels a reservation by ID if it’s for a future showtime.
 */
reservationRouter.delete(
  "/cancel/:reservationId",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { reservationId } = req.params;
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
      });
      if (!reservation) {
        res.status(404).json({ message: "Reservation not found" });
        return;
      }

      // Find the showtime
      const showtime = await prisma.showTime.findUnique({
        where: { id: reservation.showtimeId },
      });
      if (!showtime) {
        res.status(404).json({ message: "Showtime not found" });
        return;
      }

      // Check if showtime is in the past
      if (new Date(showtime.date) < new Date()) {
        res.status(400).json({ message: "Cannot cancel past reservations" });
        return;
      }

      // 1. Mark reservation as cancelled
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: "cancelled" },
      });

      // 2. Remove these seats from the showtime’s reservedSeats
      const updatedSeats = showtime.reservedSeats.filter(
        (seat) => !reservation.reservedSeats.includes(seat)
      );
      await prisma.showTime.update({
        where: { id: showtime.id },
        data: { reservedSeats: updatedSeats },
      });

      res.status(200).json({ message: "Reservation cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling reservation:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * GET /api/reservations/admin/reservations
 * Returns a revenue report for admin
 */
reservationRouter.get(
  "/admin/reservations",
  authenticate,
  authorizeAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const reservations = await prisma.reservation.findMany({
        include: {
          movie: true,
          showtime: true,
        },
      });

      if (reservations.length === 0) {
        res.status(200).json({ totalRevenue: 0, movieBreakdown: {} });
        return;
      }

      const report: {
        [key: string]: { revenue: number; totalSeatsReserved: number };
      } = {};
      let totalRevenue = 0;

      for (const reservation of reservations) {
        if (!reservation.movie || !reservation.showtime) continue;
        const movieTitle = reservation.movie.title;
        const seatsReserved = reservation.reservedSeats.length;
        const revenue = seatsReserved * 10; // Assume seat price = 10

        if (!report[movieTitle]) {
          report[movieTitle] = { revenue: 0, totalSeatsReserved: 0 };
        }
        report[movieTitle].revenue += revenue;
        report[movieTitle].totalSeatsReserved += seatsReserved;
        totalRevenue += revenue;
      }

      res.status(200).json({ totalRevenue, movieBreakdown: report });
    } catch (error: any) {
      console.error("Error generating revenue report:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

export default reservationRouter;
