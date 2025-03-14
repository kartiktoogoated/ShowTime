// types.ts

export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string; // changed from string[] to string to match the model
  posterImage: string; // now a string (URL or path), not any
}

export interface Showtime {
  id: string;
  movie: string; // this field holds the referenced movie's id
  date: string; // ISO string representing the Date from the model
  totalSeats: number;
  reservedSeats: number[];
}

export interface Reservation {
  id: string;
  userId: string;
  movieId: string;
  showtimeId: string;
  reservedSeats: number[];
  status: 'reserved' | 'cancelled';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN'; // match the backend enum values
}
