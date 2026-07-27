import express from "express";
import customerController from "../controllers/customer.controller";
import verifyToken from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/movies", customerController.getMovies);
router.get("/movies/:movieId", customerController.getMovieWithShowtimes);
router.get(
  "/showtimes/:showtimeId/seats",
  verifyToken,
  customerController.getAvailableSeats,
);
router.post("/bookings", verifyToken, customerController.bookTickets);
router.get("/bookings", verifyToken, customerController.getBookingHistory);
router.patch(
  "/bookings/:bookingId/cancel",
  verifyToken,
  customerController.cancelBooking,
);

export default router;
