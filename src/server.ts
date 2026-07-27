import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import DBConnect from "./config/DBConnect";
dotenv.config()
DBConnect()
const app = express()
app.use(express.json())
app.use(cookieParser())



const PORT = process.env.PORT || 3000
app.listen(PORT, ()=> console.log(`Server is running in http://localhost:${PORT}`)) 