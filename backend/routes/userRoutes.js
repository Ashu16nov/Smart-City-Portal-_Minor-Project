const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, userController.getUsers);
router.post('/staff', authenticateToken, userController.createStaff);
router.patch('/:id/profile', authenticateToken, userController.updateProfile);
router.patch('/:id/password', authenticateToken, userController.changePassword);
router.patch('/:id/status', authenticateToken, userController.toggleActiveStatus);

module.exports = router;
