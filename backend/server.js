import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import connectMongoDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

app.use(express.json()); // to parse req.body
app.use(express.urlencoded()); //to parse form data

app.use(cookieParser()); // parse the req for cookie as req.cookie

app.use("/api/auth" , authRoutes);

app.listen(PORT , () => {
    console.log(`Server is running on port ${8000}`);
    connectMongoDB();
})