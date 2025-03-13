import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import Movie from '../models/Movie';
import Showtime from '../models/Showtime';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads/');
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

router.post(
  '/add',
  authenticate,
  authorizeAdmin,
  upload.single('posterImage'),
  async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      const { title, description, genre, showtimes } = req.body;
      const posterImage = req.file ? req.file.path : '';

      if (!posterImage) {
        res.status(400).json({ message: 'Poster image is required' });
        return;
      }

      const parsedShowtimes = JSON.parse(showtimes);
      if (!parsedShowtimes || !Array.isArray(parsedShowtimes) || parsedShowtimes.length === 0) {
        res.status(400).json({ message: 'At least one showtime is required' });
        return;
      }

      const newMovie = new Movie({ title, description, genre, posterImage });
      await newMovie.save();

      const createdShowtimes = await Promise.all(
        parsedShowtimes.map(async (s: { date: string; totalSeats: number }) => {
          const newShowtime = new Showtime({
            movie: newMovie._id,
            date: new Date(s.date),
            totalSeats: s.totalSeats,
            reservedSeats: [],
          });
          return newShowtime.save();
        })
      );

      // No `return` in front of res.status(...) => no type conflict
      res.status(201).json({
        message: 'Movie added successfully',
        movie: newMovie,
        showtimes: createdShowtimes,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
