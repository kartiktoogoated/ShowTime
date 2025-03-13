// components/MovieList.tsx
import React from 'react';
import { Movie } from '../types';

interface MovieListProps {
  // If you need to pass in movies, define it here:
  movies?: Movie[];
}

const MovieList: React.FC<MovieListProps> = ({ movies }) => {
  return (
    <div>
      {/* Render your list of movies */}
      {movies ? (
        movies.map(movie => (
          <div key={movie.id}>
            <h3>{movie.title}</h3>
          </div>
        ))
      ) : (
        <p>No movies available</p>
      )}
    </div>
  );
};

export default MovieList;
