import mongoose, { Document, Schema, model } from "mongoose";

export interface IShowtime extends Document {
  movie: mongoose.Types.ObjectId;
  hallNumber: number;
  date: Date;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  totalCapacity: number;
}

const showtimeSchema = new Schema<IShowtime>(
  {
    movie: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    hallNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);
export default model<IShowtime>("Showtime", showtimeSchema);