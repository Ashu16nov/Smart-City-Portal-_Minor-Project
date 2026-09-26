const mongoose = require('mongoose');

const aqiDataSchema = new mongoose.Schema({
  ward: { type: String, required: true, unique: true },
  locationName: { type: String, required: true },
  aqi: { type: Number, required: true },
  pm25: { type: Number, required: true },
  pm10: { type: Number, required: true },
  o3: { type: Number, default: 25 },
  no2: { type: Number, default: 35 },
  co: { type: Number, default: 0.8 },
  temp: { type: Number, default: 28 },
  humidity: { type: Number, default: 55 },
  status: { 
    type: String, 
    enum: ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'], 
    default: 'Moderate' 
  },
  healthAdvisory: { type: String, default: 'Air quality is acceptable.' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AqiData', aqiDataSchema);
