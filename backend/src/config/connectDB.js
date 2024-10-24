const mongoose = require('mongoose');
require('colors');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // Wait up to 30 seconds before timing out
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });

        console.log('Connected to the database'.america);
    } catch (error) {
        console.error('Failed to connect to the database:'.red, error.message);
        // Exit process with failure if connection fails
        process.exit(1);
    }
};

// Enable Mongoose debugging mode (optional for debugging queries)
// mongoose.set('debug', true);

module.exports = connectDB;
