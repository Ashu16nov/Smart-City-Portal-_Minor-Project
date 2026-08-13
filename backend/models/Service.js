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
  location: { type: String, required: true },
  contactNumber: { type: String },
  workingHours: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
