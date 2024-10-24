const catchAsync = require('../utils/catchAsync')
const reviewService = require('../services/review.service')
const ApiError = require('../utils/apiError')
const httpStatus = require('http-status')
const restaurantService = require('../services/restaurant.service')
const userService = require('../services/user.service')

// GET /reviews: Get a list of all reviews of a menu ite,
const getRestaurantReviews = catchAsync(async (req, res) => {
    const { restID } = req.params;
    const restaurant = await restaurantService.getRestaurantById(restID)
    if (!restaurant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found')
    }

    const reviews = await (await reviewService.getRestaurantReviews(restID)).sort((a, b) => b.createdAt - a.createdAt)
    res.json(reviews)
})



// GET /reviews/:id: Get a specific review by its ID
const getReviewById = catchAsync(async (req, res) => {

    const review = await reviewService.getReviewById(req.params.id)
    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Review not found')
    }
    res.json(review)
})



// POST /reviews: Create a new review
const createReview = catchAsync(async (req, res) => {

    const userId = req.user._id.toString();
    const { rating, comment } = req.body;
    const { restID } = req.params;

    // check if the user reviewed before

    const reviewed = await reviewService.getReviewByUserAndRestId(userId, restID)
    if (reviewed.length > 0) {
        return res.status(400).json({ message: 'You have already reviewed this restaurant.' })
    }


    // check if the menuitem that the user trying to review exists

    const restaurant = await restaurantService.getRestaurantById(restID)
    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' })
    }

    // check if all the fields are filled

    if (!rating || !comment) {
        return res.status(400).json({ message: 'please fill all the fields' })
    }

    // retrive the users full name

    const user = await userService.getUserById(userId);



    const review = {
        user: userId,
        restaurant: restID,
        userFullName: user.fullName,
        rating,
        comment
    }
    const created = await reviewService.createReview(review)
    // update the rating attribute in the menuitem

    if (created) {
        await restaurantService.updateRating(restID);
        res.status(201).json({ data: created, message: 'Review created successfully'  })
    }


})



// PUT /reviews/:id: Update a specific review by its ID
const updateReview = catchAsync(async (req, res) => {

    const userId = req.user._id.toString();
    const review = await reviewService.getReviewById(req.params.id)

    if (!review) {
        return res.status(404).json({ message: 'Review not found' })
    }

    if (review.user.toString() !== userId) {
        return res.status(403).json({ message: 'You are not authorized to update this review' })
    }

    const { rating, comment } = req.body;

    const updateReview = {
        rating,
        comment
    }
    const updatedReview = await reviewService.updateReview(req.params.id, updateReview)

    // update the rating attribute in the menuitem

    await menuItemService.updateRating(review.menuItem);
    res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        updatedReview
    })
});




// DELETE /reviews/:id: Delete a specific review by its ID
const deleteReview = catchAsync(async (req, res) => {

    const userId = req.user._id.toString();
    const review = await reviewService.getReviewById(req.params.id)

    if (!review) {
        return res.status(404).json({ message: 'Review not found' })
    }

    if (review.user.toString() !== userId) {
        return res.status(403).json({ message: 'You are not authorized to delete this review' })
    }

    await reviewService.deleteReview(req.params.id)
    // update the rating attribute in the menuitem
    await menuItemService.updateRating(review.menuItem);

    res.json({ success: true, message: 'Review deleted successfully' })
});


module.exports = {
    getRestaurantReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
}