const mongoose = require('mongoose');
require('colors');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Attempt to connect to the database
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Connected to the database'.america);
    } catch (error) {
        console.error('Failed to connect to the database:'.red, error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
