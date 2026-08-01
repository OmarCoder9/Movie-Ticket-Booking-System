import express from "express";
import adminController from "../controllers/admin.controller";
import verifyToken from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @openapi
 * /api/admin/movies:
 *   post:
 *     summary: Create a movie as a cinema admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *               duration:
 *                 type: number
 *               description:
 *                 type: string
 *               posterURL:
 *                 type: string
 *               rating:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie created successfully
 */
router.post("/movies", verifyToken, adminController.createMovie);

/**
 * @openapi
 * /api/admin/movies/{movieId}:
 *   patch:
 *     summary: Update a movie
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie updated successfully
 */
router.patch("/movies/:movieId", verifyToken, adminController.updateMovie);

/**
 * @openapi
 * /api/admin/movies/{movieId}:
 *   delete:
 *     summary: Delete a movie and its related showtimes/bookings
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 */
router.delete("/movies/:movieId", verifyToken, adminController.deleteMovie);

/**
 * @openapi
 * /api/admin/showtimes:
 *   post:
 *     summary: Create a showtime as a cinema admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movie:
 *                 type: string
 *               hallNumber:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               ticketPrice:
 *                 type: number
 *               totalCapacity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Showtime created successfully
 */
router.post("/showtimes", verifyToken, adminController.createShowtime);

/**
 * @openapi
 * /api/admin/showtimes/{showtimeId}:
 *   patch:
 *     summary: Update a showtime
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Showtime updated successfully
 */
router.patch(
  "/showtimes/:showtimeId",
  verifyToken,
  adminController.updateShowtime,
);

/**
 * @openapi
 * /api/admin/showtimes/{showtimeId}:
 *   delete:
 *     summary: Delete a showtime if it has no confirmed bookings
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Showtime deleted successfully
 */
router.delete(
  "/showtimes/:showtimeId",
  verifyToken,
  adminController.deleteShowtime,
);

/**
 * @openapi
 * /api/admin/showtimes/{showtimeId}/ticket-price:
 *   patch:
 *     summary: Update the ticket price for a showtime
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket price updated successfully
 */
router.patch(
  "/showtimes/:showtimeId/ticket-price",
  verifyToken,
  adminController.updateTicketPrice,
);

/**
 * @openapi
 * /api/admin/showtimes/{showtimeId}/seats:
 *   get:
 *     summary: View seat availability for a showtime
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seat status fetched successfully
 */
router.get(
  "/showtimes/:showtimeId/seats",
  verifyToken,
  adminController.getSeatStatus,
);

/**
 * @openapi
 * /api/admin/showtimes/{showtimeId}/seats:
 *   patch:
 *     summary: Block or unblock a seat for a showtime
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seatNumber:
 *                 type: number
 *               action:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seat status updated successfully
 */
router.patch(
  "/showtimes/:showtimeId/seats",
  verifyToken,
  adminController.updateSeatStatus,
);

/**
 * @openapi
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings for the cinema
 *     responses:
 *       200:
 *         description: Bookings fetched successfully
 */
router.get("/bookings", verifyToken, adminController.getAllBookings);

export default router;
