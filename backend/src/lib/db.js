import mongoose from "mongoose";


async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDB connected")
    } catch (error) {
        console.log("Error in MongoDB connection", error)
        process.exit(1)
    }
}

export default connectDB