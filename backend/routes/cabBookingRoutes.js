const express = require('express');
const router = express.Router();
const cabBookingController = require('../controllers/cabBookingController');
const authenticateToken = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Book a cab
router.post('/book', cabBookingController.createBooking);

// Get my bookings
router.get('/my-bookings', cabBookingController.getMyBookings);

// Get specific booking
router.get('/:id', cabBookingController.getBookingById);

// Cancel booking
router.put('/cancel/:id', cabBookingController.cancelBooking);

module.exports = router;
