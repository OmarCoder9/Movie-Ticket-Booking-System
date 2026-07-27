import { Request, Response } from "express";
import httpStatusText from "../utils/httpStatusText";
import User, { IUser } from "../models/user.model";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateJWT";

const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role } = req.body || {};
    if (!fullName || !email || !password)
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "Full name, email and Password are required to register",
      });
    const user = await User.findOne({ email });
    if (user)
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "there is an account with this email try logging in",
      });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: newUser,
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
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        status: httpStatusText.FAIL,
        msg: "This email doesn't has an account try signing up",
      });
    const isPasswordsMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordsMatched)
      return res
        .status(400)
        .json({
          status: httpStatusText.FAIL,
          msg: "Invalid email or password",
        });

    const token = await generateToken({ id: user._id, email, role: user.role });
    res.cookie("token", token, {httpOnly:true})
    res.status(200).json({status: httpStatusText.SUCCESS})

  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      msg: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
export default {register, login}