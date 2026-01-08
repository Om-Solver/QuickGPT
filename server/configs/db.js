import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Add connection event listeners
        mongoose.connection.on('connected', () => console.log('Database connected'))
        mongoose.connection.on('error', (err) => console.log('Database connection error:', err))
        mongoose.connection.on('disconnected', () => console.log('Database disconnected'))

        // Connect with timeout configuration
        await mongoose.connect(`${process.env.MONGODB_URI}/quickgpt`, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4
            retryWrites: true,
            w: 'majority'
        })
        console.log('MongoDB connected successfully')
    } catch (error) {
        console.error('MongoDB connection failed:', error.message)
        process.exit(1)
    }
}

export default connectDB;