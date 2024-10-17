const express = require("express")
const router = express.Router()
const multer = require('multer')

const upload = multer()


const { requireSignIn, adminMiddleware } = require('../Middleware/authMiddleware')

const { createMenuItem, getMenuItemById, getMenuItemsByRestaurant, getAllMenu, deleteMenuItem, updateMenuItem, getMyRestaurantMenuItems } = require('../controllers/menuItems.controller')

router.post('/create', requireSignIn, adminMiddleware, upload.single('image'), createMenuItem)
router.get('/:itemId', getMenuItemById)
router.get('/restaurant/:restaurantId', getMenuItemsByRestaurant)
router.get('/', getAllMenu)
router.delete('/delete/:itemId', requireSignIn, adminMiddleware, deleteMenuItem)
router.put('/update/:menuId', requireSignIn, adminMiddleware, upload.single('image'), updateMenuItem)
router.get('/my/restaurant', requireSignIn, adminMiddleware, getMyRestaurantMenuItems)

module.exports = router