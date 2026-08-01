import { Request, Response } from "express";
import Movie, { MovieStatus } from "../models/movie.model";
import Showtime from "../models/showtime.model";
import Booking, { BookingStatus } from "../models/booking.model";
import httpStatusText from "../utils/httpStatusText";
import { UserRoles } from "../models/user.model";

interface AuthRequest extends Request {
  user?: { id: string; email: string; role?: string };
}

const ensureAdmin = (req: AuthRequest, res: Response) => {
  if (req.user?.role !== UserRoles.ADMIN) {
    res.status(403).json({
      status: httpStatusText.FAIL,
      msg: "Only cinema admins can use this feature",
    });
    return false;
  }

  return true;
};

const createMovie = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { title, genre, duration, description, posterURL, rating, status } =
      req.body || {};

    if (
      !title ||
      !genre ||
      !duration ||
      !description ||
      !posterURL ||
      rating === undefined ||
      !status
    ) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "All movie fields are required",
      });
    }

    if (Number(rating) < 0 || Number(rating) > 10) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Rating must be between 0 and 10",
      });
    }

    const movie = await Movie.create({
      title,
      genre,
      duration,
      description,
      posterURL,
      rating,
      status,
    });

    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const updateMovie = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Movie not found",
      });
    }

    if (
      req.body?.rating !== undefined &&
      (Number(req.body.rating) < 0 || Number(req.body.rating) > 10)
    ) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Rating must be between 0 and 10",
      });
    }

    Object.assign(movie, req.body);
    await movie.save();

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const deleteMovie = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Movie not found",
      });
    }

    const showtimes = await Showtime.find({ movie: movieId as any }).select(
      "_id",
    );
    const showtimeIds = showtimes.map((showtime) => showtime._id);

    await Booking.deleteMany({ showtime: { $in: showtimeIds } });
    await Showtime.deleteMany({ movie: movieId as any });
    await Movie.findByIdAndDelete(movieId);

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      msg: "Movie deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const createShowtime = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const {
      movie,
      hallNumber,
      date,
      startTime,
      endTime,
      ticketPrice,
      totalCapacity,
    } = req.body || {};

    if (
      !movie ||
      hallNumber === undefined ||
      !date ||
      !startTime ||
      !endTime ||
      ticketPrice === undefined ||
      totalCapacity === undefined
    ) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Showtime details are required",
      });
    }

    const existingMovie = await Movie.findById(movie);
    if (!existingMovie) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Movie not found",
      });
    }

    const showtimeStart = new Date(
      `${new Date(date).toISOString().split("T")[0]}T${startTime}`,
    );
    if (new Date() >= showtimeStart) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Showtimes must be scheduled for a future date and time",
      });
    }

    const showtime = await Showtime.create({
      movie,
      hallNumber,
      date,
      startTime,
      endTime,
      ticketPrice,
      totalCapacity,
    });

    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: showtime,
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const updateShowtime = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { showtimeId } = req.params;
    const showtime = await Showtime.findById(showtimeId);

    if (!showtime) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Showtime not found",
      });
    }

    if (req.body?.date || req.body?.startTime || req.body?.endTime) {
      const nextDate = req.body?.date ? new Date(req.body.date) : showtime.date;
      const nextStart = req.body?.startTime || showtime.startTime;
      const nextEnd = req.body?.endTime || showtime.endTime;
      const nextStartDate = new Date(
        `${nextDate.toISOString().split("T")[0]}T${nextStart}`,
      );
      const nextEndDate = new Date(
        `${nextDate.toISOString().split("T")[0]}T${nextEnd}`,
      );

      if (nextEndDate <= nextStartDate) {
        return res.status(400).json({
          status: httpStatusText.FAIL,
          msg: "Showtime end time must be after the start time",
        });
      }

      if (new Date() >= nextStartDate) {
        return res.status(400).json({
          status: httpStatusText.FAIL,
          msg: "Showtimes must be scheduled for a future date and time",
        });
      }
    }

    Object.assign(showtime, req.body);
    await showtime.save();

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: showtime,
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const deleteShowtime = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { showtimeId } = req.params;
    const showtime = await Showtime.findById(showtimeId);

    if (!showtime) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Showtime not found",
      });
    }

    const confirmedBookings = await Booking.find({
      showtime: showtimeId as any,
      bookingStatus: { $ne: BookingStatus.CANCELLED },
    });

    if (confirmedBookings.length > 0) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Showtime cannot be deleted because it has confirmed bookings",
      });
    }

    await Booking.deleteMany({ showtime: showtimeId as any });
    await Showtime.findByIdAndDelete(showtimeId);

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      msg: "Showtime deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const updateTicketPrice = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { showtimeId } = req.params;
    const { ticketPrice } = req.body || {};

    if (ticketPrice === undefined || ticketPrice === null) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "ticketPrice is required",
      });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Showtime not found",
      });
    }

    showtime.ticketPrice = ticketPrice;
    await showtime.save();

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: showtime,
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const getSeatStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureAdmin(req, res)) return;

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
    const blockedSeats = new Set(showtime.blockedSeats || []);
    const allSeats = Array.from(
      { length: showtime.totalCapacity },
      (_, index) => `Seat ${index + 1}`,
    );

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        showtime,
        totalSeats: allSeats.length,
        bookedSeats: Array.from(bookedSeats),
        blockedSeats: Array.from(blockedSeats),
        availableSeats: allSeats.filter(
          (seat) => !bookedSeats.has(seat) && !blockedSeats.has(seat),
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const updateSeatStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { showtimeId } = req.params;
    const { seatNumber, action } = req.body || {};

    if (!seatNumber || !action) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "seatNumber and action are required",
      });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        msg: "Showtime not found",
      });
    }

    const seatLabel = `Seat ${seatNumber}`;
    const bookings = await Booking.find({
      showtime: showtimeId as any,
      bookingStatus: { $ne: BookingStatus.CANCELLED },
    });

    const bookedSeats = new Set(
      bookings.flatMap((booking) => booking.selectedSeats),
    );
    const isBooked = bookedSeats.has(seatLabel);

    if (action === "block") {
      if (isBooked) {
        return res.status(400).json({
          status: httpStatusText.FAIL,
          msg: "This seat is already booked by a customer",
        });
      }

      if (!showtime.blockedSeats.includes(seatLabel)) {
        showtime.blockedSeats = [...showtime.blockedSeats, seatLabel];
        await showtime.save();
      }

      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        msg: "Seat blocked successfully",
        data: { seatNumber, status: "blocked" },
      });
    }

    if (action === "unblock") {
      showtime.blockedSeats = (showtime.blockedSeats || []).filter(
        (seat) => seat !== seatLabel,
      );
      await showtime.save();

      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        msg: "Seat unblocked successfully",
        data: { seatNumber, status: "available" },
      });
    }

    return res.status(400).json({
      status: httpStatusText.FAIL,
      msg: "action must be either block or unblock",
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const bookings = await Booking.find({})
      .populate({ path: "customer", select: "fullName email" })
      .populate({
        path: "showtime",
        populate: { path: "movie", select: "title" },
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

export default {
  createMovie,
  updateMovie,
  deleteMovie,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  updateTicketPrice,
  getSeatStatus,
  updateSeatStatus,
  getAllBookings,
};
