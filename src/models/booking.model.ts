import mongoose, { Document, Schema, model } from "mongoose";

export enum BookingStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  CANCELLED = "Cancelled",
}
export interface IBooking extends Document {
  customer: mongoose.Types.ObjectId;
  showtime: mongoose.Types.ObjectId;
  selectedSeats: string[];
  totalPrice: number;
  bookingStatus: BookingStatus;
}

const bookingSchema = new Schema<IBooking>({
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    showtime: {
      type: Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },

    selectedSeats: {
      type: [String],
      required: true,
      validate: {
        validator: (seats: string[]) => seats.length > 0,
        message: "At least one seat must be selected",
      },
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    bookingStatus: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default model<IBooking>("Booking", bookingSchema)