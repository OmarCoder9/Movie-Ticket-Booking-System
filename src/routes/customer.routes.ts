import express from "express";
import customerController from "../controllers/customer.controller";
import verifyToken from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @openapi
 * /api/movies:
 *   get:
 *     summary: List movies with optional filters
 *     responses:
 *       200:
 *         description: Movies fetched successfully
 */
router.get("/movies", customerController.getMovies);

/**
 * @openapi
 * /api/movies/{movieId}:
 *   get:
 *     summary: Get a movie with its showtimes
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie and showtimes fetched successfully
 */
router.get("/movies/:movieId", customerController.getMovieWithShowtimes);

/**
 * @openapi
 * /api/showtimes/{showtimeId}/seats:
 *   get:
 *     summary: Get available seats for a showtime
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Available seats fetched successfully
 */
router.get(
  "/showtimes/:showtimeId/seats",
  verifyToken,
  customerController.getAvailableSeats,
);

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     summary: Book tickets for a showtime
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post("/bookings", verifyToken, customerController.bookTickets);

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     summary: Get booking history for the logged-in customer
 *     responses:
 *       200:
 *         description: Booking history fetched successfully
 */
router.get("/bookings", verifyToken, customerController.getBookingHistory);

/**
 * @openapi
 * /api/bookings/{bookingId}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.patch(
  "/bookings/:bookingId/cancel",
  verifyToken,
  customerController.cancelBooking,
);

export default router;
