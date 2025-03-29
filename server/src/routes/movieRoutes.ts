import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import Movie from '../models/Movie';
import Showtime from '../models/Showtime';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';
import { Parser } from 'json2csv';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = Router();

// Storage and file filter configuration for multer (used in POST route)
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

// GET route to fetch all movies
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try{
    //Get page and limit from query params, defaults to page 1 and 10 movies per page
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    //Fetching movies w pagination
    const movies = await Movie.find().skip(skip).limit(limit);

    //Fetching total count for client side pagination metadata
    const totalMovies = await Movie.countDocuments();
    const totalPages = Math.ceil(totalMovies / limit);

    res.status(200).json({
      movies,
      page,
      totalPages,
      totalMovies,
    });
  } catch (error:any){
    res.status(500).json({message: error.message});
  }
});

// POST route to add a movie
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

      await Promise.all(
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

      res.status(201).json({
        message: 'Movie added successfully',
        movie: newMovie,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

//
router.get('/download'), async(req:Request, res:Response): Promise<void> => {
  try{
    //Fetch movies
    const movies = await Movie.find().lean();

    //Define which fields should be included in csv
    const fields = ['_id','title','description','genre','posterImage'];
    const json2csvParser = new Parser({fields});
    const csv = json2csvParser.parse(movies);

    //Set the appropriate headers for csv file download
    res.header('Content-Type','text-csv');
    res.attachment('movies.csv');

    //Send the CSV file content
    res.send(csv);
  } catch (error: any){
    res.status(500).json({ message: error.message});
  }
};

// DELETE route to remove all movies (placed before the ID-based route)
router.delete(
  '/delete-all',
  authenticate,
  authorizeAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await Movie.deleteMany({});
      await Showtime.deleteMany({});
      res.status(200).json({ message: 'All movies deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE route to remove a movie by ID
router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const movieId = req.params.id;
      const deletedMovie = await Movie.findByIdAndDelete(movieId);
      if (!deletedMovie) {
        res.status(404).json({ message: 'Movie not found' });
        return;
      }
      // Optionally, delete related showtimes:
      await Showtime.deleteMany({ movie: movieId });
      res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
