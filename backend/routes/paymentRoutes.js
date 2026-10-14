const express = require('express');
const router = express.Router();

// 1. Import the functions - make sure the names match the controller
const { createOrder, verifyPayment } = require('../controllers/paymentController');

// 2. Import the auth middleware
const { auth } = require('../middlewares/auth');

// 3. Register the routes
// If createOrder or verifyPayment are undefined, this line crashes
router.post('/order', auth, createOrder); 
router.post('/verify', auth, verifyPayment);

module.exports = router;