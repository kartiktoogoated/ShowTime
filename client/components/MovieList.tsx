/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Movie } from '../types';

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/movies');
      // Assuming the response has a "movies" array
      setMovies(response.data.movies);
    } catch (err: any) {
      console.error('Error fetching movies:', err);
      setError('Failed to fetch movies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  if (loading) {
    return <p>Loading movies...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="space-y-4">
      {movies.length > 0 ? (
        movies.map(movie => (
          <div key={movie.id} className="p-4 border rounded">
            <h3 className="text-xl font-bold">{movie.title}</h3>
            {movie.posterImage && (
              <img 
                src={`http://localhost:5000/${movie.posterImage}`} 
                alt={movie.title} 
                className="w-48 h-auto mt-2" 
              />
            )}
            {movie.description && <p className="mt-2">{movie.description}</p>}
          </div>
        ))
      ) : (
        <p>No movies available</p>
      )}
    </div>
  );
};

export default MovieList;
