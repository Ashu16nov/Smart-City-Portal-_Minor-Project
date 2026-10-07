const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Water Supply', 'Electricity', 'Waste Management', 'Public Transport',
      'Hospitals', 'Schools/Colleges', 'Government Offices', 'Banks/ATMs',
      'Police Stations', 'Fire Stations', 'Parks', 'Libraries',
      'Public Toilets', 'Parking', 'Community Centers'
    ]
  },
  description: { type: String },
  detailedDescription: { type: String },
  location: { type: String, required: true },
  address: { type: String },
  area: { type: String },
  landmark: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  
  contactNumber: { type: String }, // same as phone
  emergencyPhone: { type: String },
  email: { type: String },
  website: { type: String },
  
  workingHours: { type: String }, // same as timings
  status: { type: String, enum: ['Available', 'Open', 'Closed', 'Temporarily Unavailable', 'Under Maintenance', 'Emergency Only'], default: 'Available' },
  
  facilities: [{ type: String }],
  servicesOffered: [{ type: String }],
  requirements: [{ type: String }],
  fees: { type: String },
  accessibility: [{ type: String }],
  
  onlineServices: [{
    name: { type: String },
    url: { type: String }
  }],
  complaintType: { type: String }, // e.g. "Utilities", "Public Safety"
  
  hospitalStats: {
    availableBeds: { type: Number, default: 0 },
    icuBeds: { type: Number, default: 0 },
    bloodBank: {
      A_pos: { type: Number, default: 0 },
      O_pos: { type: Number, default: 0 },
      B_pos: { type: Number, default: 0 },
      AB_pos: { type: Number, default: 0 },
      A_neg: { type: Number, default: 0 },
      O_neg: { type: Number, default: 0 },
      B_neg: { type: Number, default: 0 },
      AB_neg: { type: Number, default: 0 }
    }
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
