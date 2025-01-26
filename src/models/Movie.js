// In src/models/Movie.js

const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  posterImage: {
    type: String, // Assuming you're storing the URL to the image
    required: true
  }
});

// Check if the model is already defined, if yes, use the existing model, otherwise define it
const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);

module.exports = Movie;
