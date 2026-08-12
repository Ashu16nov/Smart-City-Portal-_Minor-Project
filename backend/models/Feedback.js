const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, default: 'Anonymous' },
  rating: { type: String },
  feedback: { type: String, required: true },
  component: { type: String },
  date: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
