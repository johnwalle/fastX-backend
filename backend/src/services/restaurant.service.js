const Restaurant = require('../models/restaurant.schema');
const reviewService = require('../services/review.service');

// create a new restaurant

const createRestaurant = async (body) => {
    const restaurant = await Restaurant.create(body);
    return restaurant;
}

// // get all restaurants

// const getRestaurants = async () => {
//     const restaurants = await Restaurant.find({}).sort({ updatedAt: -1 });
//     return restaurants;
// }


// Service function to get filtered, searched, and sorted restaurants
const getRestaurants = async (filters) => {
    const { cuisine, search, sort } = filters;

    // Initialize filter and sort objects
    let filter = {};
    let sortOption = {};

    // Check if any filter or search criteria are provided
    const isFiltering = cuisine || search || sort;

    // Apply filtering by cuisine (checks if the cuisine exists in the array)
    if (cuisine) {
        filter.cuisine_types = { $in: [cuisine] }; // Filters restaurants containing the specified cuisine
    }

    // Adding search functionality (search by name)
    if (search) {
        filter.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    // Apply sorting based on the provided sort option
    if (sort === 'name_asc') {
        sortOption.name = 1; // Sort by name A-Z
    } else if (sort === 'name_desc') {
        sortOption.name = -1; // Sort by name Z-A
    } else if (sort === 'highly_rated') {
        sortOption.rating = -1; // Sort by highest rated
    }

    // Fetch all restaurants if no filter or search criteria are provided
    if (!isFiltering) {
        return await Restaurant.find();
    }

    // Fetch filtered, searched, and sorted restaurants
    return await Restaurant.find(filter).sort(sortOption);
};




// get Restaurant by email

const getRestaurantByEmail = async (email) => {
    const restaurant = await Restaurant.findOne({ email });
    return restaurant;
}

// get restaurant by id

const getRestaurantById = async (id) => {
    const restaurant = await Restaurant.findById(id);
    return restaurant;
}



// delete restaurant

const deleteRestaurant = async (id) => {
    const restaurant = await Restaurant.findByIdAndDelete(id);
    return restaurant;
}


// update restaurant


const updateRestaurant = async (restId, updateData) => {
    try {
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(restId, updateData, {
            new: true,
        }).exec();
        return updatedRestaurant;
    } catch (error) {
        // Handle any potential error
        throw new Error("Failed to update restaurnat");
    }
};

///////////////////////// Review Service //////////////////////////

const updateRating = async (restID) => {
    try {
        const restaurantReviews = await reviewService.getRestaurantReviews(restID);
        const numberofReviews = restaurantReviews.length;
        const totalRating = restaurantReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / numberofReviews;
        const roundedRating = Math.round(averageRating * 10) / 10;

        const updateRestaurant = await Restaurant.findByIdAndUpdate(restID, { rating: roundedRating }, {
            new: true,
        }).exec();
        return updateRestaurant;
    } catch (error) {
        // Handle any potential error
        throw new Error("Failed to update the rating of the restaurant.");
    }
}



module.exports = {
    createRestaurant,
    getRestaurants,
    getRestaurantByEmail,
    getRestaurantById,
    deleteRestaurant,
    updateRestaurant,
    updateRating
}
