const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getMyRestaurant
} = require('../controllers/restaurant.controller');

const {
    requireSignIn,
    adminMiddleware,
    superAdminMiddleware,

} = require('../Middleware/authMiddleware');
const upload = multer();


router.get('/my-restaurant', requireSignIn, adminMiddleware, getMyRestaurant);
router.post('/create', requireSignIn, superAdminMiddleware, upload.single('image'), createRestaurant);
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.delete('/delete/:id', requireSignIn, superAdminMiddleware, deleteRestaurant);
router.put('/update/:id', requireSignIn, adminMiddleware, upload.single("image"), updateRestaurant);

module.exports = router;