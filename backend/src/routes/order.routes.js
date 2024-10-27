const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middleware/authmiddleware');



router.post('/create', auth.requireSignIn, orderController.createOrder);
router.get('/all', auth.requireSignIn, auth.superAdminMiddleware, orderController.getAllOrders);
router.get('/user', auth.requireSignIn, orderController.getAllUserOrders);
router.get('/get/:orderId', auth.requireSignIn, orderController.getOrderById);
router.put('/update/:orderId', auth.requireSignIn, auth.superAdminMiddleware, orderController.updateOrderStatus);



module.exports = router;