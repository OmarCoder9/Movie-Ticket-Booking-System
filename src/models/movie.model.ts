import { Schema, model } from "mongoose";

export enum MovieStatus {
  SHOWING = "Now Showing",
  SOON = "Coming Soon",
}

export interface IMovie extends Document {
  title: string;
  genre: string[];
  duration: number;
  description: string;
  posterURL: string;
  rating: number;
  status: MovieStatus;
}

const movieSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: [String],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      required: true,
    },
    posterURL: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    status: {
      type: String,
      enum: Object.values(MovieStatus),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
export default model<IMovie>("Movie", movieSchema);
