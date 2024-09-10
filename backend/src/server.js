const express = require('express');
require('colors');
require('dotenv').config();

const app = express();
const cors = require('cors'); // Import the cors package
const connectDB = require('./config/connectDB');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const menuRoutes = require('./routes/menu.routes');
const reviewRoutes = require('./routes/review.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const driverRoutes = require('./routes/driver.routes');
const checkoutRoutes = require('./routes/checkout.routes')

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/checkout', checkoutRoutes)


// Connect to the database and then start the server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start the server after successful database connection
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`.cyan.bold);
        });
    } catch (error) {
        console.error('Failed to start server:'.red, error);
        process.exit(1); // Exit process if there is an error starting the server
    }
};

startServer();
