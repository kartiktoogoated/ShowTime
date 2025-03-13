import mongoose, { Document, Schema } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description: string;
  genre: string;
  posterImage: string;
}

const movieSchema: Schema<IMovie> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  posterImage: { type: String, required: true }
});

export default mongoose.model<IMovie>('Movie', movieSchema);
