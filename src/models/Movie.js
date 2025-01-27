const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String, required: true },
    posterImage: { type: String, required: true },
});

module.exports = mongoose.model('Movie', movieSchema);
