const mongoose = require('mongoose');

const smartParkingSchema = new mongoose.Schema({
  spotId: { type: String, required: true, unique: true },
  locationName: { type: String, required: true },
  address: { type: String, required: true },
  ward: { type: String, required: true },
  totalSlots: { type: Number, required: true, default: 50 },
  availableSlots: { type: Number, required: true, default: 20 },
  hourlyRate: { type: Number, required: true, default: 30 },
  isEVChargingAvailable: { type: Boolean, default: false },
  latitude: { type: Number },
  longitude: { type: Number },
  reservations: [{
    bookingId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    slotNumber: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    durationHours: { type: Number, default: 2 },
    totalAmount: { type: Number, default: 60 },
    status: { type: String, enum: ['Active', 'Completed', 'Cancelled'], default: 'Active' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SmartParking', smartParkingSchema);
