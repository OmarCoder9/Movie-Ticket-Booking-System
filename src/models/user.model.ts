import mongoose, { Document, Schema, model } from "mongoose";
import validator from "validator";

export enum UserRoles {
  CUSTOMER = "Customer",
  ADMIN = "Cinema Admin",
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: UserRoles;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid Email"],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRoles),
      default: UserRoles.CUSTOMER,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IUser>("User", userSchema);
