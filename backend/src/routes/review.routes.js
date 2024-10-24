const express = require('express')
const router = express.Router()
const reviewController = require('../controllers/review.controller')
const auth = require('../middleware/authmiddleware');

router.get('/:id', reviewController.getReviewById)
router.get('/restaurant/:restID', reviewController.getRestaurantReviews)
router.post('/create/:restID', auth.requireSignIn, reviewController.createReview)
router.put('/update/:id', auth.requireSignIn, reviewController.updateReview)
router.delete('/delete/:id', auth.requireSignIn, reviewController.deleteReview)


module.exports = router
