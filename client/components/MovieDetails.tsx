import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Movie } from '../types';
import BookingModal from './BookingModal';
const API_URL = process.env.NEXT_PUBLIC_API_URL; // Make sure this is set in Vercel


interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onClose }) => {
  const [showBooking, setShowBooking] = React.useState(false);

  return (
    <>
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gray-800 rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Poster Image + Close Button */}
          <div className="relative">
            {/* Check if posterImage is absolute; if not, prepend base URL */}
            const API_URL = process.env.NEXT_PUBLIC_API_URL;

<img
  src={
    movie.posterImage.startsWith('http')
      ? movie.posterImage
      : `${API_URL}/${movie.posterImage}`
  }
  alt={movie.title}
  className="w-full h-[300px] object-cover"
/>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Movie Info */}
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-4">{movie.title}</h2>
            <h3 className="text-xl font-semibold mb-2">About the Movie</h3>
            <p className="text-gray-400 mb-4">{movie.description}</p>
            <p className="text-gray-400">
              <strong>Genre:</strong> {movie.genre}
            </p>
            {/* Book Tickets Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowBooking(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-md text-lg font-semibold transition-colors"
              >
                Book Tickets
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal movie={movie} onClose={() => setShowBooking(false)} />
      )}
    </>
  );
};

export default MovieDetails;
