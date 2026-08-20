const mongoose = require('mongoose');

const emergencyReportSchema = new mongoose.Schema({
  citizenId: { type: String, required: true }, // Keeping it as String to match how users are handled via ID strings or references
  emergencyType: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmergencyReport', emergencyReportSchema);
