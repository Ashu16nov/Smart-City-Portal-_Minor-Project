const AqiData = require('../models/AqiData');

// Seed default AQI data if empty
const seedDefaultAqi = async () => {
  const count = await AqiData.countDocuments();
  if (count === 0) {
    const wards = [
      {
        ward: 'Shivaji Nagar',
        locationName: 'Shivaji Nagar Transit Hub',
        aqi: 82,
        pm25: 28,
        pm10: 64,
        o3: 30,
        no2: 42,
        co: 0.9,
        temp: 29,
        humidity: 52,
        status: 'Moderate',
        healthAdvisory: 'Air quality is acceptable; however, sensitive individuals should limit outdoor exertion.'
      },
      {
        ward: 'Kothrud',
        locationName: 'Kothrud Hill Front',
        aqi: 45,
        pm25: 12,
        pm10: 32,
        o3: 20,
        no2: 25,
        co: 0.4,
        temp: 27,
        humidity: 60,
        status: 'Good',
        healthAdvisory: 'Air quality is satisfactory and poses little or no risk.'
      },
      {
        ward: 'Hadapsar',
        locationName: 'Hadapsar Industrial Zone',
        aqi: 142,
        pm25: 58,
        pm10: 110,
        o3: 45,
        no2: 68,
        co: 1.5,
        temp: 31,
        humidity: 48,
        status: 'Unhealthy for Sensitive Groups',
        healthAdvisory: 'Members of sensitive groups may experience health effects. General public is less likely affected.'
      },
      {
        ward: 'Viman Nagar',
        locationName: 'Viman Nagar Airport Road',
        aqi: 95,
        pm25: 34,
        pm10: 78,
        o3: 35,
        no2: 46,
        co: 1.0,
        temp: 30,
        humidity: 50,
        status: 'Moderate',
        healthAdvisory: 'Moderate air quality. Unusually sensitive people should consider reducing prolonged outdoor exertion.'
      },
      {
        ward: 'Aundh',
        locationName: 'Aundh IT Park & Botanical Garden',
        aqi: 58,
        pm25: 18,
        pm10: 45,
        o3: 22,
        no2: 29,
        co: 0.5,
        temp: 28,
        humidity: 58,
        status: 'Moderate',
        healthAdvisory: 'Good air quality with minimal air pollution.'
      },
      {
        ward: 'Baner',
        locationName: 'Baner Bio-Diversity Park',
        aqi: 48,
        pm25: 14,
        pm10: 36,
        o3: 18,
        no2: 22,
        co: 0.3,
        temp: 27,
        humidity: 62,
        status: 'Good',
        healthAdvisory: 'Clean and fresh air. Enjoy outdoor activities.'
      }
    ];
    await AqiData.insertMany(wards);
    console.log('✅ AQI Telemetry Data Seeded successfully');
  }
};

exports.getAllAqi = async (req, res) => {
  try {
    await seedDefaultAqi();
    const data = await AqiData.find().sort({ aqi: -1 });
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAqiByWard = async (req, res) => {
  try {
    const data = await AqiData.findOne({ ward: new RegExp(req.params.ward, 'i') });
    if (!data) return res.status(404).json({ success: false, message: 'Ward not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
