const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authenticateToken = require('../middleware/authMiddleware');

// Public or Authenticated routes
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Admin-only routes (protected by authenticateToken + role check in controller)
router.post('/', authenticateToken, serviceController.createService);
router.put('/:id', authenticateToken, serviceController.updateService);
router.delete('/:id', authenticateToken, serviceController.deleteService);

module.exports = router;
