const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.get('/', parkingController.getAllParking);
router.post('/reserve', parkingController.reserveSpot);
router.get('/my-reservations/:userId', parkingController.getUserReservations);

module.exports = router;
