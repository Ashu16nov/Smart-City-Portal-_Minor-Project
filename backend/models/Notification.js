const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true // Can be a specific user ID, or 'global' for all users
  },
  type: {
    type: String,
    enum: ['Complaint', 'Announcement', 'Account', 'System'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
