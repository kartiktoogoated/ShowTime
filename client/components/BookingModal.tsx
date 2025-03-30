/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, CreditCard } from 'lucide-react';
import axios from 'axios';
import { Movie, Showtime } from '../types';

interface BookingModalProps {
  movie: Movie; // movie must include a showtimes array from the backend
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ movie, onClose }) => {
  // Use the movie's showtimes (default to empty array if undefined)
  const showtimes: Showtime[] = movie.showtimes || [];
  const [selectedShowtime, setSelectedShowtime] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const handleBooking = async () => {
    if (!selectedShowtime) return;

    // Find the selected showtime from the movie's showtimes array.
    const showtimeObj = showtimes.find((st) => st._id === selectedShowtime);
    if (!showtimeObj) {
      setError('Showtime not found');
      return;
    }

    // Compute the number of tickets left.
    const availableCount = showtimeObj.totalSeats - showtimeObj.reservedSeats.length;
    if (availableCount < selectedSeats) {
      setError('Not enough seats available.');
      return;
    }

    // Simulate available seat numbers (as indices).
    const availableSeatNumbers: number[] = [];
    for (let i = 0; i < showtimeObj.totalSeats; i++) {
      if (!showtimeObj.reservedSeats.includes(i)) {
        availableSeatNumbers.push(i);
      }
    }
    const seatsToReserve = availableSeatNumbers.slice(0, selectedSeats);

    try {
      setLoading(true);
      setError('');
      await axios.post(
        'http://localhost:3000/api/reservations/reserve',
        {
          movieId: movie._id,
          showtimeId: selectedShowtime,
          seats: seatsToReserve,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // Optionally update local state here to reflect the booking.
      onClose();
    } catch (err: any) {
      console.error('Error booking reservation:', err.response?.data || err.message);
      setError(err.response?.data.message || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-800 rounded-lg overflow-hidden max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-6">Book Tickets - {movie.title}</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {/* Showtime Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Select Showtime
            </h3>
            {showtimes.length === 0 ? (
              <p className="text-gray-400">No showtimes available for this movie.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {showtimes.map((st: Showtime) => {
                  const availableCount = st.totalSeats - st.reservedSeats.length;
                  return (
                    <button
                      key={st._id}
                      onClick={() => setSelectedShowtime(st._id)}
                      className={`p-3 rounded-lg border transition-colors ${
                        selectedShowtime === st._id
                          ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                          : 'border-gray-700 hover:border-purple-500'
                      }`}
                    >
                      <div className="text-sm font-medium">{formatDate(st.date)}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {availableCount} tickets left
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Seat Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Number of Seats
            </h3>
            <select
              value={selectedSeats}
              onChange={(e) => setSelectedSeats(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'seat' : 'seats'}
                </option>
              ))}
            </select>
          </div>
          {/* Booking Button */}
          <div className="pt-6 border-t border-gray-700">
            <button
              onClick={handleBooking}
              disabled={!selectedShowtime || loading}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingModal;
