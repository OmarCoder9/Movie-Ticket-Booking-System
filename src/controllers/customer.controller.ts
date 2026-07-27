import { Request, Response } from "express";
import Movie from "../models/movie.model";
import Showtime from "../models/showtime.model";
import Booking, { BookingStatus } from "../models/booking.model";
import httpStatusText from "../utils/httpStatusText";
import { UserRoles } from "../models/user.model";

interface AuthRequest extends Request {
  user?: { id: string; email: string; role?: string };
}

const createSeatLabels = (capacity: number) => {
  return Array.from({ length: capacity }, (_, index) => `Seat ${index + 1}`);
};

const ensureCustomer = (req: AuthRequest, res: Response) => {
  if (req.user?.role !== UserRoles.CUSTOMER) {
    res.status(403).json({
      status: httpStatusText.FAIL,
      msg: "Only customers can use this feature",
    });
    return false;
  }

  return true;
};

const getMovies = async (req: Request, res: Response) => {
  try {
    const limit: number = Number(req.query.limit) || 20;
    const page: number = Number(req.query.page) || 1;
    const skip: number = (page - 1) * limit;
    const movies = await Movie.find({})
      .select("-__v -createdAt -updatedAt")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const getMovieWithShowtimes = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId).select(
      "-__v -createdAt -updatedAt",
    );
    if (!movie) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Movie not found",
      });
    }

    const showtimes = await Showtime.find({ movie: movieId as any })
      .populate("movie", "title posterURL")
      .select("-__v -createdAt -updatedAt");

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        movie,
        showtimes,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const getAvailableSeats = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureCustomer(req, res)) return;

    const { showtimeId } = req.params;
    const showtime = await Showtime.findById(showtimeId);

    if (!showtime) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Showtime not found",
      });
    }

    const bookings = await Booking.find({
      showtime: showtimeId as any,
      bookingStatus: { $ne: BookingStatus.CANCELLED },
    });

    const bookedSeats = new Set(
      bookings.flatMap((booking) => booking.selectedSeats),
    );
    const allSeats = createSeatLabels(showtime.totalCapacity);
    const availableSeats = allSeats.filter((seat) => !bookedSeats.has(seat));

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        showtime,
        availableSeats,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const bookTickets = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureCustomer(req, res)) return;

    const { showtimeId, selectedSeats } = req.body || {};
    if (
      !showtimeId ||
      !Array.isArray(selectedSeats) ||
      selectedSeats.length === 0
    ) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "showtimeId and selectedSeats are required",
      });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Showtime not found",
      });
    }

    const existingBookings = await Booking.find({
      showtime: showtimeId,
      bookingStatus: { $ne: BookingStatus.CANCELLED },
    });

    const bookedSeats = new Set(
      existingBookings.flatMap((booking) => booking.selectedSeats),
    );
    const unavailableSeats = selectedSeats.filter((seat: string) =>
      bookedSeats.has(seat),
    );

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Some selected seats are already booked",
        data: { unavailableSeats },
      });
    }

    const totalPrice = showtime.ticketPrice * selectedSeats.length;
    if (!req.user?.id) {
      return res.status(401).json({
        status: httpStatusText.FAIL,
        msg: "User is not authenticated",
      });
    }

    const booking = await Booking.create({
      customer: req.user.id as any,
      showtime: showtimeId as any,
      selectedSeats,
      totalPrice,
      bookingStatus: BookingStatus.CONFIRMED,
    });

    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const getBookingHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureCustomer(req, res)) return;

    const bookings = await Booking.find({ customer: req.user?.id as any })
      .populate({
        path: "showtime",
        populate: { path: "movie", select: "title posterURL" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureCustomer(req, res)) return;

    const { bookingId } = req.params;
    const booking = await Booking.findOne({
      _id: bookingId as any,
      customer: req.user?.id as any,
    });

    if (!booking) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Booking not found",
      });
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Booking is already cancelled",
      });
    }

    const showtime = await Showtime.findById(booking.showtime);
    if (!showtime) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Showtime not found",
      });
    }

    const showtimeStart = new Date(
      `${showtime.date.toISOString().split("T")[0]}T${showtime.startTime}`,
    );
    if (new Date() >= showtimeStart) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Cannot cancel booking after the movie has started",
      });
    }

    booking.bookingStatus = BookingStatus.CANCELLED;
    await booking.save();

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      msg: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export default {
  getMovies,
  getMovieWithShowtimes,
  getAvailableSeats,
  bookTickets,
  getBookingHistory,
  cancelBooking,
};
