import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { v2 as cloudinary } from "cloudinary";
import mongoose from 'mongoose';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js';
import notificationRoutes from './routes/notification.route.js';

import connectMongoDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';
const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

const __dirname = path.resolve();

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLODINARY_API_KEY,
    api_secret : process.env.CLODINARY_API_SECRET,
})


app.use(express.json({limit:'5mb'})); // to parse req.body
app.use(express.urlencoded()); //to parse form data
mongoose.set('strictPopulate', false);
app.use(cookieParser()); // parse the req for cookie as req.cookie

app.use("/api/auth" , authRoutes);
app.use("/api/users" , userRoutes);
app.use("/api/post" , postRoutes);
app.use("/api/notification" , notificationRoutes);

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname , "/frontend/dist")));

    app.get("*" , (req,res) => {
        res.sendFile(path.resolve(__dirname , "frontend" , "dist" , "index.html"));
    })
}

app.listen(PORT , () => {
    console.log(`Server is running on port ${8000}`);
    connectMongoDB();
})