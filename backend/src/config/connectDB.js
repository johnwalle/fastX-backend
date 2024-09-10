const mongoose = require('mongoose');
require('colors');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Connected to the database'.america);
    } catch (error) {
        console.error('Failed to connect to the database:'.red, error);
    }
};

// Enable Mongoose debugging mode
// mongoose.set('debug', true);

module.exports = connectDB;
