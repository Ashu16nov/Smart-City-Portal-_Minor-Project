const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const authenticateToken = require('../middleware/authMiddleware');

// Public/Citizen Routes for Contacts
router.get('/contacts', emergencyController.getContacts);

// Protected Routes (Citizen) for Reports
router.post('/reports', authenticateToken, emergencyController.reportEmergency);

// Admin Routes for Contacts
router.get('/admin/contacts', authenticateToken, emergencyController.getAllContactsAdmin);
router.post('/contacts', authenticateToken, emergencyController.addContact);
router.put('/contacts/:id', authenticateToken, emergencyController.updateContact);
router.delete('/contacts/:id', authenticateToken, emergencyController.deleteContact);

// Admin Routes for Reports
router.get('/admin/reports', authenticateToken, emergencyController.getReports);
router.put('/reports/:id/status', authenticateToken, emergencyController.updateReportStatus);

module.exports = router;
