import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, CreditCard } from 'lucide-react';
import { Movie, Showtime } from '../types';

interface BookingModalProps {
  movie: Movie;
  onClose: () => void;
}

// SAMPLE_SHOWTIMES now matches your updated Showtime interface:
//   id, movie, date, totalSeats, reservedSeats
const SAMPLE_SHOWTIMES: Showtime[] = [
  {
    id: '1',
    movie: '1', // references Movie ID
    date: '2024-03-20T10:00:00',
    totalSeats: 100,
    reservedSeats: [0, 1, 2], // example of 3 seats already taken
  },
  {
    id: '2',
    movie: '1',
    date: '2024-03-20T13:30:00',
    totalSeats: 80,
    reservedSeats: [0, 1, 2, 3, 4],
  },
  {
    id: '3',
    movie: '1',
    date: '2024-03-20T16:00:00',
    totalSeats: 50,
    reservedSeats: [],
  },
  {
    id: '4',
    movie: '1',
    date: '2024-03-20T19:30:00',
    totalSeats: 120,
    reservedSeats: [0, 1, 2, 3, 4, 5, 6],
  },
];

const BookingModal: React.FC<BookingModalProps> = ({ movie, onClose }) => {
  const [selectedShowtime, setSelectedShowtime] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<number>(1);

  const handleBooking = () => {
    // Here you would typically make an API call to create the reservation
    console.log('Booking:', { movie, showtime: selectedShowtime, seats: selectedSeats });
    onClose();
  };

  // Utility to format the date nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
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

          <div className="space-y-6">
            {/* SHOWTIME SELECTION */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Select Showtime
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {SAMPLE_SHOWTIMES.map(showtime => {
                  // Calculate how many seats remain
                  const availableSeats = showtime.totalSeats - showtime.reservedSeats.length;

                  return (
                    <button
                      key={showtime.id}
                      onClick={() => setSelectedShowtime(showtime.id)}
                      className={`p-3 rounded-lg border ${
                        selectedShowtime === showtime.id
                          ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                          : 'border-gray-700 hover:border-purple-500'
                      } transition-colors`}
                    >
                      <div className="text-sm font-medium">{formatDate(showtime.date)}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {availableSeats} seats available
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEAT SELECTION */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Number of Seats
              </h3>
              <select
                value={selectedSeats}
                onChange={(e) => setSelectedSeats(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'seat' : 'seats'}
                  </option>
                ))}
              </select>
            </div>

            {/* BOOKING BUTTON */}
            <div className="pt-6 border-t border-gray-700">
              <button
                onClick={handleBooking}
                disabled={!selectedShowtime}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingModal;
