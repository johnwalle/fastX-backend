const mongoose = require('mongoose');
require('colors');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Attempt to connect to the database
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds instead of default 10 seconds
            socketTimeoutMS: 45000, // Timeout for sockets after 45 seconds of inactivity
        });

        console.log('Connected to the database'.america);
    } catch (error) {
        console.error('Failed to connect to the database:'.red, error.message);
        // Exit the process on failure
        process.exit(1);
    }
};

module.exports = connectDB;
