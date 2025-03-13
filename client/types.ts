export interface Movie {
    id: string;
    title: string;
    description: string;
    duration: number;
    genre: string[];
    posterUrl: string;
    rating: number;
    director: string;
    cast: string[];
    releaseDate: string;
    trailerUrl: string;
  }
  
  export interface Showtime {
    id: string;
    movieId: string;
    datetime: string;
    price: number;
    availableSeats: number;
  }
  
  export interface Reservation {
    id: string;
    movieId: string;
    showtimeId: string;
    seats: number[];
    totalPrice: number;
    status: 'confirmed' | 'cancelled';
    createdAt: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  }