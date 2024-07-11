import mongoose from 'mongoose';

const connectMongoDB = async () =>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MOngoDB connected : ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to mongoDB : ${error.message}`);
        process.exit(1);
    }
}

export default connectMongoDB;