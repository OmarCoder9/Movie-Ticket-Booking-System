import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import adminRoutes from "./routes/admin.routes";
import loggerMiddleware from "./middlewares/logger.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

dotenv.config();

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());
  app.use(loggerMiddleware);

  app.use("/auth", authRoutes);
  app.use("/api", customerRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  return app;
};

export default createApp;
