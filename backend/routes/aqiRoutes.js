const express = require('express');
const router = express.Router();
const aqiController = require('../controllers/aqiController');

router.get('/', aqiController.getAllAqi);
router.get('/:ward', aqiController.getAqiByWard);

module.exports = router;
