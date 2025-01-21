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

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
