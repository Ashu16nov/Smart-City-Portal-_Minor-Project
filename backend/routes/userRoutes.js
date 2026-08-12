const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', userController.getUsers);
router.patch('/:id', authenticateToken, userController.updateUser);

module.exports = router;
