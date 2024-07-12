import express from 'express';
import dotenv from 'dotenv';
import { v2 as cloudinary } from "cloudinary";

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import connectMongoDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLODINARY_API_KEY,
    api_secret : process.env.CLODINARY_API_SECRET,
})


app.use(express.json()); // to parse req.body
app.use(express.urlencoded()); //to parse form data

app.use(cookieParser()); // parse the req for cookie as req.cookie

app.use("/api/auth" , authRoutes);
app.use("/api/users" , userRoutes);

app.listen(PORT , () => {
    console.log(`Server is running on port ${8000}`);
    connectMongoDB();
})