const express = require("express");
const auth = require('../Middleware/authMiddleware');
const checkoutController = require("../controllers/checkout.controller");
const router = express.Router();

router.post('/', auth.requireSignIn, checkoutController.createOrder);
router.get('/verify/:id', checkoutController.verifyCheckout)

module.exports = router