const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, default: 'Anonymous' },
  type: { type: String, enum: ['Feedback', 'Suggestion'], default: 'Feedback' },
  rating: { type: String }, // used if type === 'Feedback'
  feedback: { type: String, required: true },
  component: { type: String }, // used as category
  date: { type: String },
  isRead: { type: Boolean, default: false },
  adminResponse: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
