const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const restaurantService = require('../services/restaurant.service');
const cloudinary = require('../config/cloudinary.config')
const httpStatus = require('http-status');
const userService = require('../services/user.service');
// Create a new restaurant
const createRestaurant = catchAsync(async (req, res) => {

    const { name, email, cuisine_types, description, address, working_days, phone_number, operating_hours, location } = req.body;

    console.log("the body-data", req.body);

    const user = await userService.getUserByEmail(email);
    
    if (!user) {
        return res.status(httpStatus.BAD_REQUEST).json({
            status: 'error',
            message: 'The restaurant email has to be registered first'
        });
    }


    const restaurant = await restaurantService.getRestaurantByEmail(email);

    if (restaurant) {
        return res.status(httpStatus.BAD_REQUEST).json({
            status: 'error',
            message: 'There is already a restaurant with that email'
        });
    }

    // Check if the phone number starts with +251
    if (!phone_number.startsWith('+251')) {
        return res.status(httpStatus.BAD_REQUEST).json({
            status: 'error',
            message: 'Phone number must start with +251'
        });
    }


    // Check if the rest of the number is numeric and has the correct length
    const phoneWithoutCountryCode = phone_number.slice(4); // Remove +251
    if (!/^\d{9}$/.test(phoneWithoutCountryCode)) {
        return res.status(httpStatus.BAD_REQUEST).json({
            status: 'error',
            message: 'Phone number must have 9 digits after +251'
        });
    }



    const imageFile = req.file.buffer;

    const uploadImage = () => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: 'Restaurants',
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (error) {
                            console.error(error);
                            reject("Failed to upload image to Cloudinary");
                        } else {
                            console.log("Image uploaded successfully!");
                            resolve(result.secure_url);
                        }
                    }
                )
                .end(imageFile);
        });
    };

    const imageUrl = await uploadImage();


    const restaurants = {
        name,
        email,
        cuisine_types,
        description,
        address,
        location,
        working_days,
        phone_number,
        operating_hours,
        image: imageUrl
    };

    await restaurantService.createRestaurant(restaurants);
    res.status(httpStatus.CREATED).json({
        status: 'success',
        message: 'Restaurant created successfully',
    })
});

// const getRestaurants = catchAsync(async (req, res) => {
//     const restaurants = await restaurantService.getRestaurants();
//     res.status(httpStatus.OK).json(restaurants);
// });


// Controller to handle the request and response
const getRestaurants = async (req, res) => {
    try {
        // Extract query parameters from the request
        const filters = {
            cuisine: req.query.cuisine,
            search: req.query.search,
            sort: req.query.sort,
        };

        // Fetch data using the service
        const restaurants = await restaurantService.getRestaurants(filters);

        // Send successful response
        res.status(200).json({ success: true, data: restaurants });
    } catch (error) {
        // Handle errors
        res.status(500).json({ success: false, message: error.message });
    }
};


// get restaurant by id
const getRestaurantById = catchAsync(async (req, res) => {

    const restId = req.params.id;
    const restaurant = await restaurantService.getRestaurantById(restId);
    if (!restaurant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
    }
    res.status(httpStatus.OK).json(restaurant);
});


// delete restaurant

const deleteRestaurant = catchAsync(async (req, res) => {
    const restId = req.params.id;
    const restaurant = await restaurantService.getRestaurantById(restId);
    if (!restaurant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
    }
    await restaurantService.deleteRestaurant(restId);
    res.status(httpStatus.OK).json({
        status: 'success',
        message: 'Restaurant deleted successfully'
    });
});


// update restaurant

const updateRestaurant = catchAsync(async (req, res) => {
    console.log("the body-data to update", req.body);
    const restId = req.params.id;
    let restaurant = await restaurantService.getRestaurantById(restId);
    if (!restaurant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
    }

    const { name, email, cuisine_types, description, address, working_days, phone_number, operating_hours, location } = req.body;


    // check if the email exist
    if (email && (!/^\S+@\S+\.\S+$/.test(email))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email format');
    }

    const restExist = await restaurantService.getRestaurantByEmail(email);

    if (restExist && restExist._id.toString() !== restId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email is already taken");
    }




    if (req.file) {
        const imageFile = req.file.buffer;

        const uploadImage = () => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            folder: 'Restaurants',
                            resource_type: 'image'
                        },
                        (error, result) => {
                            if (error) {
                                console.error(error);
                                reject("Failed to upload image to Cloudinary");
                            } else {
                                console.log("Image uploaded successfully!");
                                resolve(result.secure_url);
                            }
                        }
                    )
                    .end(imageFile);
            });
        };

        const imageUrl = await uploadImage();
        restaurant.image = imageUrl;
    }

    // check if the email is already taken


    restaurant.name = name;
    restaurant.email = email;
    restaurant.cuisine_types = cuisine_types;
    restaurant.description = description;
    restaurant.address = address;
    restaurant.working_days = working_days;
    restaurant.phone_number = phone_number;
    restaurant.operating_hours = operating_hours;
    restaurant.location = location;

    const updatedRestaurant = await restaurantService.updateRestaurant(restId, restaurant);

    res.status(httpStatus.OK).json({
        message: 'Restaurant updated successfully',
        updatedRestaurant: updatedRestaurant
    });
});



// get my restaurant

const getMyRestaurant = catchAsync(async (req, res) => {
    const user = req.user;
    const restaurant = await restaurantService.getRestaurantByEmail(user.email);
    if (!restaurant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
    }
    res.status(httpStatus.OK).json(restaurant);
});




module.exports = {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    deleteRestaurant,
    updateRestaurant,
    getMyRestaurant
}   