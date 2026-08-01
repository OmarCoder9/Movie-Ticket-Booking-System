import { Request, Response } from "express";
import httpStatusText from "../utils/httpStatusText";
import User, { IUser, UserRoles } from "../models/user.model";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateJWT";
import validator from "validator";

const isStrongPassword = (password: string) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
    password,
  );
};

const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role } = req.body || {};
    if (!fullName || !email || !password) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Full name, email and Password are required to register",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Please provide a valid email address",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    const normalizedRole = role || UserRoles.CUSTOMER;
    if (!Object.values(UserRoles).includes(normalizedRole)) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Role must be Customer or Cinema Admin",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "there is an account with this email try logging in",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: normalizedRole,
    });
    await newUser.save();
    const displayedData = {
      _id: newUser._id,
      fullName,
      email,
      role: normalizedRole,
    };
    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: displayedData,
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "email and password are required",
      });
    const user = await User.findOne(
      { email },
      { __v: 0, createdAt: 0, updatedAt: 0 },
    );
    if (!user)
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "This email doesn't has an account try signing up",
      });
    const isPasswordsMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordsMatched)
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Invalid email or password",
      });

    const token = generateToken({
      id: user._id.toString(),
      email,
      role: user.role,
    });
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
export default { register, login };
