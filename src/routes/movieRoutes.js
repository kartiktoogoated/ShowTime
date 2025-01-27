const express = require('express');
const multer = require('multer');
const path = require('path');
const Movie = require('../models/Movie.js');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware.js');


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

// Create a new movie (Only Admins)
router.post('/add', authenticate, authorizeAdmin, upload.single('posterImage'), async (req, res) => {
  try {
    const { title, description, genre } = req.body;
    const posterImage = req.file ? req.file.path : '';  // Get the file path from multer (if file is uploaded)

    if (!posterImage) {
      return res.status(400).json({ message: 'Poster image is required' });
    }

    const newMovie = new Movie({
      title,
      description,
      genre,
      posterImage,
    });
    await newMovie.save();
    res.status(201).json({ message: 'Movie added successfully', movie: newMovie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update movie details (Only Admins)
router.put('/update/:id', authenticate, authorizeAdmin, upload.single('posterImage'), async (req, res) => {
  try {
    const { title, description, genre } = req.body;
    const posterImage = req.file ? req.file.path : undefined;  // Handle the file update (if a new image is uploaded)

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { title, description, genre, posterImage },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json({ message: 'Movie updated successfully', movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a movie (Only Admins)
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

// Get all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
