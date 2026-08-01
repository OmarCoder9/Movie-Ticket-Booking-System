import express from "express";
import adminController from "../controllers/admin.controller";
import verifyToken from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @openapi
 * /api/admin/movies:
 *   post:
 *     summary: Create a movie as a cinema admin
 *     responses:
 *       201:
 *         description: Movie created successfully
 */
router.post("/movies", verifyToken, adminController.createMovie);
router.patch("/movies/:movieId", verifyToken, adminController.updateMovie);
router.delete("/movies/:movieId", verifyToken, adminController.deleteMovie);

/**
 * @openapi
 * /api/admin/showtimes:
 *   post:
 *     summary: Create a showtime as a cinema admin
 *     responses:
 *       201:
 *         description: Showtime created successfully
 */
router.post("/showtimes", verifyToken, adminController.createShowtime);
router.patch(
  "/showtimes/:showtimeId",
  verifyToken,
  adminController.updateShowtime,
);
router.delete(
  "/showtimes/:showtimeId",
  verifyToken,
  adminController.deleteShowtime,
);
router.patch(
  "/showtimes/:showtimeId/ticket-price",
  verifyToken,
  adminController.updateTicketPrice,
);
router.get(
  "/showtimes/:showtimeId/seats",
  verifyToken,
  adminController.getSeatStatus,
);
router.patch(
  "/showtimes/:showtimeId/seats",
  verifyToken,
  adminController.updateSeatStatus,
);

router.get("/bookings", verifyToken, adminController.getAllBookings);

export default router;
