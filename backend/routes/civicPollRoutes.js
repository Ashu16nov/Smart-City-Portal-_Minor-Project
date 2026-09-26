const express = require('express');
const router = express.Router();
const civicPollController = require('../controllers/civicPollController');

router.get('/', civicPollController.getAllPolls);
router.post('/vote', civicPollController.votePoll);
router.post('/', civicPollController.createPoll);

module.exports = router;
