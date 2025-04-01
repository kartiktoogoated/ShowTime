import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

// Calculate uploads directory relative to this file
const uploadsDir = path.join(__dirname, '../../../uploads');

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const movieRouter = Router();

// Configure multer storage and file filtering
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
}

const upload = multer({ storage, fileFilter });

/**
 * GET /api/movies
 * Fetch all movies with pagination and include showtimes.
 */
movieRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const movies = await prisma.movie.findMany({
      skip,
      take: limit,
      include: { showtimes: true },
    });
    const totalMovies = await prisma.movie.count();
    const totalPages = Math.ceil(totalMovies / limit);

    res.status(200).json({ movies, page, totalPages, totalMovies });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/movies/add
 * Add a new movie along with its showtimes.
 */
movieRouter.post(
  '/add',
  authenticate,
  authorizeAdmin,
  upload.single('posterImage'),
  async (req: MulterRequest, res: Response) => {
    try {
      const { title, description, genre, showtimes } = req.body;
      // Convert the absolute file path to a relative path (e.g., "uploads/filename.jpg")
      const posterImage = req.file ? path.join('uploads', path.basename(req.file.path)) : '';

      if (!posterImage) {
        res.status(400).json({ message: 'Poster image is required' });
        return;
      }

      if (!showtimes) {
        res.status(400).json({ message: 'Showtimes data is required' });
        return;
      }

      let parsedShowtimes;
      try {
        parsedShowtimes = JSON.parse(showtimes);
      } catch (err) {
        res.status(400).json({ message: 'Showtimes data is not valid JSON' });
        return;
      }

      if (!Array.isArray(parsedShowtimes) || parsedShowtimes.length === 0) {
        res.status(400).json({ message: 'At least one showtime is required' });
        return;
      }

      const newMovie = await prisma.movie.create({
        data: {
          title,
          description,
          genre,
          posterImage,
        },
      });

      // Create each showtime record and link it to the new movie
      await Promise.all(
        parsedShowtimes.map(async (s: { date: string; totalSeats: number }) => {
          await prisma.showTime.create({
            data: {
              movieId: newMovie.id,
              date: new Date(s.date),
              totalSeats: s.totalSeats,
              reservedSeats: [], // initially empty
            },
          });
        })
      );

      res.status(201).json({
        message: 'Movie added successfully',
        movie: newMovie,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * GET /api/movies/download
 * Download all movies as a CSV file.
 */
movieRouter.get('/download', async (req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany();
    const fields = ['id', 'title', 'description', 'genre', 'posterImage'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(movies);

    res.header('Content-Type', 'text/csv');
    res.attachment('movies.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/movies/delete-all
 * Delete all movies and their associated showtimes.
 */
movieRouter.delete('/delete-all', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    await prisma.movie.deleteMany();
    await prisma.showTime.deleteMany();
    res.status(200).json({ message: 'All movies deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/movies/:id
 * Delete a movie by ID and optionally its related showtimes.
 */
movieRouter.delete('/:id', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const movieId = req.params.id;
    // Delete the movie
    const deletedMovie = await prisma.movie.delete({
      where: { id: movieId },
    });
    if (!deletedMovie) {
      res.status(404).json({ message: 'Movie not found' });
      return;
    }
    // Delete related showtimes
    await prisma.showTime.deleteMany({
      where: { movieId: movieId },
    });
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/movies/filter
 * Filter movies by genre and date range.
 * Example query parameters: ?genre=Sci-Fi&startDate=2025-03-20&endDate=2025-03-21
 */
movieRouter.get('/filter', async (req: Request, res: Response) => {
  try {
    const { genre, startDate, endDate } = req.query;
    const where: any = {};
    if (genre) {
      where.genre = genre as string;
    }
    if (startDate || endDate) {
      where.showtimes = {
        some: {
          date: {
            ...(startDate ? { gte: new Date(startDate as string) } : {}),
            ...(endDate ? { lte: new Date(endDate as string) } : {}),
          },
        },
      };
    }
    
    const movies = await prisma.movie.findMany({
      where,
      include: { showtimes: true },
    });
    
    res.status(200).json(movies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default movieRouter;
