// This file connects to mongodb instance
import mongoose from 'mongoose'

// Import dotenv
import dotenv from "dotenv";
dotenv.config();

// The connection string to mongodb
const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGO_CONNECTION_STRING);

        console.log('Successfully connected to MongoDB')
    } catch (error) {
        console.log(`Error! Could not connect to MongoDB: ${error}`)
        process.exit(1);
    }
}

export {connectToMongoDB}