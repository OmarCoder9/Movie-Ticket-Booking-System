import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import httpStatusText from "../utils/httpStatusText";

interface JwtPayload {
  id: string;
  email: string;
  role?: string;
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      status: httpStatusText.FAIL,
      msg: "Token is required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string,
    ) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: httpStatusText.FAIL,
      msg: "Invalid or expired token",
    });
  }
};

export default verifyToken;
