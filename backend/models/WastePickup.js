const mongoose = require('mongoose');

const wastePickupSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userPhone: { type: String, default: '' },
  address: { type: String, required: true },
  ward: { type: String, required: true },
  wasteType: { 
    type: String, 
    enum: ['Solid Household Waste', 'E-Waste', 'Hazardous Chemical Waste', 'Bulk Furniture & Appliances', 'Recyclable Plastic & Paper'], 
    required: true 
  },
  preferredDate: { type: String, required: true },
  preferredSlot: { type: String, default: 'Morning (8 AM - 12 PM)' },
  status: { 
    type: String, 
    enum: ['Requested', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'], 
    default: 'Requested' 
  },
  ecoPointsEarned: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('WastePickup', wastePickupSchema);
