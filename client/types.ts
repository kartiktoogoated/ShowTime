/* eslint-disable @typescript-eslint/no-explicit-any */
// types.ts
import { Key } from 'react';

export interface Movie {
  showtimes: any;
  _id: Key | null | undefined;  // from Mongo, if needed
  id: string;                   // your own ID field
  title: string;
  description: string;
  duration: number;             // or 'unknown' if you prefer
  genre: string;                // single string, e.g. "Action, Sci-Fi"
  posterImage: string;          // URL or path to the poster
  rating: string;               // store as string if that's what your backend returns
}

export interface Showtime {
  _id: string;
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
