const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');

router.get('/', wasteController.getPickups);
router.post('/', wasteController.requestPickup);
router.patch('/:id/status', wasteController.updatePickupStatus);
router.get('/centers', wasteController.getRecyclingCenters);

module.exports = router;
