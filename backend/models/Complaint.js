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
    enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'], 
    default: 'Submitted' 
  },
  department: { type: String, default: 'General' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  district: { type: String },
  ward: { type: String },
  location: { type: String },
  image: { type: String }, // base64 string
  adminNote: { type: String, default: '' },
  resolutionProof: { type: String }, // base64 string for proof
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  },
  history: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    changedBy: { type: String } // 'Admin', 'Citizen', or 'System'
  }]
}, { timestamps: true });

// Indexing for faster execution
complaintSchema.index({ userId: 1, complaintId: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
