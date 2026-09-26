const express = require('express');
const router = express.Router();
const localBusinessController = require('../controllers/localBusinessController');

router.get('/', localBusinessController.getBusinesses);
router.post('/', localBusinessController.addBusiness);

module.exports = router;
