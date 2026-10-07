const mongoose = require('mongoose');

const cabBookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: String,
    required: true
  },
  transportMode: { 
    type: String, 
    enum: ['Cab', 'Bus', 'Metro'], 
    default: 'Cab' 
  },
  routeId: { type: String }, // E.g., 'Bus Route 24', 'Metro Red Line'
  isPass: { type: Boolean, default: false },
  pickup: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  cabType: {
    type: String,
    enum: ['Mini', 'Sedan', 'SUV', 'Metro Ticket', 'Bus Pass'],
    required: true
  },
  baseFare: {
    type: Number,
    required: true
  },
  perKmRate: {
    type: Number,
    required: true
  },
  totalFare: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['BOOKED', 'DRIVER_ASSIGNED', 'COMPLETED', 'CANCELLED'],
    default: 'BOOKED'
  },
  driver: {
    name: { type: String, default: 'Rahul Sharma' },
    vehicle: { type: String, default: 'Sedan' },
    vehicleNumber: { type: String, default: 'RJ14AB1234' }
  }
}, { timestamps: true });

module.exports = mongoose.model('CabBooking', cabBookingSchema);
