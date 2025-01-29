const express = require('express');
const multer = require('multer');
const path = require('path');
const Movie = require('../models/Movie.js');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware.js');
const Showtime = require('../models/Showtime');

// Set up multer for file upload (poster image)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');  // Ensure this folder exists in your project
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Store the file with a unique name
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  },
});

// Helper function to extract showtimes from form data
const extractShowtimes = (req) => {
  const showtimes = [];
  let index = 0;
  while (req.body[`showtime[${index}]`]) {
    const date = req.body[`showtime[${index}][date]`];
    const availableSeats = req.body[`showtime[${index}][availableSeats]`];
    if (date && availableSeats) {
      showtimes.push({
        date: new Date(date),
        availableSeats: parseInt(availableSeats, 10),
      });
    }
    index++;
  }
  return showtimes;
};

router.post('/add', authenticate, authorizeAdmin, upload.single('posterImage'), async (req, res) => {
  try {
    const { title, description, genre, showtimes } = req.body;
    const posterImage = req.file ? req.file.path : '';  

    if (!posterImage) {
      return res.status(400).json({ message: 'Poster image is required' });
    }

    const parsedShowtimes = JSON.parse(showtimes);

    if (!parsedShowtimes || !Array.isArray(parsedShowtimes) || parsedShowtimes.length === 0) {
      return res.status(400).json({ message: 'At least one showtime is required' });
    }

    const newMovie = new Movie({
      title,
      description,
      genre,
      posterImage,
    });
    await newMovie.save();

    const createdShowtimes = await Promise.all(
      parsedShowtimes.map(async (showtime) => {
        const newShowtime = new Showtime({
          movie: newMovie._id,
          date: new Date(showtime.date),
          totalSeats: showtime.totalSeats,
          reservedSeats: [],
        });
        return await newShowtime.save();
      })
    );

    res.status(201).json({
      message: 'Movie added successfully',
      movie: newMovie,
      showtimes: createdShowtimes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/update/:id', authenticate, authorizeAdmin, upload.single('posterImage'), async (req, res) => {
  try {
    const { title, description, genre } = req.body;
    const posterImage = req.file ? req.file.path : undefined;  

    const showtimes = extractShowtimes(req);  

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    if (title) movie.title = title;
    if (description) movie.description = description;
    if (genre) movie.genre = genre;
    if (posterImage) {
      movie.posterImage = posterImage;
    }
    if (showtimes && showtimes.length > 0) {
      movie.showtimes = showtimes;
    }
    await movie.save();

    res.status(200).json({ message: 'Movie updated successfully', movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/delete/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
