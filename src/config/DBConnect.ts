import mongoose from "mongoose";

const DBConnect = () => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    console.error(
      "MongoDB connection string is missing. Set MONGO_URL in your .env file.",
    );
    return;
  }

  mongoose
    .connect(mongoUrl)
    .then(() => console.log("MongoDB Server Started"))
    .catch((e) => console.error("MongoDB connection failed:", e));
};

export default DBConnect;
