const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true }, // Example: CMP123456
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: 'Anonymous Citizen' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'], 
    default: 'Pending' 
  },
  district: { type: String },
  ward: { type: String },
  location: { type: String },
  image: { type: String }, // base64 string
  adminNote: { type: String, default: '' }
}, { timestamps: true });

// Indexing for faster execution
complaintSchema.index({ userId: 1, complaintId: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
