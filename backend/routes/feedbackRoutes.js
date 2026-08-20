const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', feedbackController.getFeedbacks);
router.get('/report/stats', feedbackController.generateReport);
router.post('/', feedbackController.createFeedback);
router.patch('/:id', feedbackController.updateFeedback);
router.delete('/:id', feedbackController.deleteFeedback);
router.delete('/purge/all', authenticateToken, feedbackController.purgeFeedbacks);

module.exports = router;
