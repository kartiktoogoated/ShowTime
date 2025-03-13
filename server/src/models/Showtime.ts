import mongoose, { Document, Schema } from 'mongoose';

export interface IShowtime extends Document {
  movie: mongoose.Types.ObjectId;
  date: Date;
  totalSeats: number;
  reservedSeats: number[];
}

const showtimeSchema: Schema = new Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  totalSeats: {
    type: Number,
    required: true,
  },
  reservedSeats: {
    type: [Number],
    default: [],
  },
});

const Showtime = mongoose.model<IShowtime>('Showtime', showtimeSchema);
export default Showtime;
