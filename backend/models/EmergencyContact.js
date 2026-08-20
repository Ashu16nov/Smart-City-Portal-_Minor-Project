const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  title: { type: String, required: true },
  contactNumber: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, default: '' },
  instructions: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
