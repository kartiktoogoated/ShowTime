import React from 'react';
import { motion } from 'framer-motion';
import { X, Star, Clock, Calendar, User } from 'lucide-react';
import { Movie } from '../types';
import BookingModal from './BookingModal';

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onClose }) => {
  const [showBooking, setShowBooking] = React.useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gray-800 rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="relative">
            <img 
              src={movie.posterUrl} 
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

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">{movie.title}</h2>
              <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-full">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-semibold">{movie.rating}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">About the Movie</h3>
                <p className="text-gray-400 mb-4">{movie.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genre.map(genre => (
                    <span 
                      key={genre}
                      className="bg-purple-500 bg-opacity-20 text-purple-400 px-3 py-1 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{movie.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{movie.releaseDate}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Cast & Crew</h3>
                <div className="mb-4">
                  <h4 className="text-gray-400 mb-2">Director</h4>
                  <p className="font-medium">{movie.director}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 mb-2">Cast</h4>
                  <div className="space-y-2">
                    {movie.cast.map(actor => (
                      <div key={actor} className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{actor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
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

      {showBooking && (
        <BookingModal movie={movie} onClose={() => setShowBooking(false)} />
      )}
    </>
  );
};

export default MovieDetails;