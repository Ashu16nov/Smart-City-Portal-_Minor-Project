const express = require('express');
const router = express.Router();
const {
  getPublicAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleImportance
} = require('../controllers/announcementController');

// Public route (Citizens)
router.get('/public', getPublicAnnouncements);

// Admin routes (Assume front-end logic restricts access for now, or you can add middleware)
router.get('/', getAllAnnouncements);
router.post('/', createAnnouncement);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);
router.patch('/:id/toggle-importance', toggleImportance);

module.exports = router;
