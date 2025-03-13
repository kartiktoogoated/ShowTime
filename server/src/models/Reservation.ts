// models/Reservation.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IReservation extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  showtimeId: mongoose.Types.ObjectId;
  reservedSeats: number[];
  status: 'reserved' | 'cancelled';
}

const reservationSchema = new Schema<IReservation>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true,
  },
  reservedSeats: {
    type: [Number],
    required: true,
  },
  status: {
    type: String,
    enum: ['reserved', 'cancelled'],
    default: 'reserved',
  },
});

export default mongoose.model<IReservation>('Reservation', reservationSchema);
