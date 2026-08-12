const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authenticateToken = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

router.get('/', complaintController.getComplaints);
router.get('/user/:userId', complaintController.getUserComplaints);
router.get('/:complaintId', complaintController.getComplaintById);
router.post('/create', complaintController.createComplaint);
router.put('/update/:complaintId', complaintController.updateComplaint);
router.delete('/:id', complaintController.deleteComplaint);
router.delete('/purge/all', complaintController.purgeComplaints);

module.exports = router;
