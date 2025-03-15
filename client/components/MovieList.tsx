/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import MovieDetails from './MovieDetails';
import { Movie } from '../types';
const API_URL = process.env.VITE_API_URL; // Make sure this is set in Vercel

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/movies`);
        // Assuming the response contains { movies: Movie[] }
        setMovies(response.data.movies);
      } catch (err: any) {
        console.error('Error fetching movies:', err);
        setError('Failed to fetch movies.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <p>Loading movies...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {movies.map((movie, index) => (
          <motion.div
            key={movie._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-200"
          >
            const API_URL = process.env.VITE_API_URL;

<img
  src={
    movie.posterImage.startsWith('http')
      ? movie.posterImage
      : `${API_URL}/${movie.posterImage}`
  }
  alt={movie.title}
  className="w-full h-[300px] object-cover"
/>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{movie.title}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span>{movie.rating ?? 'N/A'}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {movie.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {movie.duration ? `${movie.duration} min` : 'Duration N/A'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMovie(movie)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <span>Know More</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </>
  );
};

export default MovieList;
