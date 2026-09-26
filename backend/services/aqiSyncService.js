const AqiData = require('../models/AqiData');

// Ward Geo-Coordinates Map for Live Open-Meteo Air Quality Telemetry
const WARD_COORDINATES = [
  { ward: 'Shivaji Nagar', locationName: 'Shivaji Nagar Transit & Commercial Hub', lat: 18.5314, lon: 73.8446 },
  { ward: 'Kothrud', locationName: 'Kothrud Hill Front & Paud Road Sector', lat: 18.5074, lon: 73.8077 },
  { ward: 'Hadapsar', locationName: 'Hadapsar Industrial & IT Corridor', lat: 18.5089, lon: 73.9260 },
  { ward: 'Viman Nagar', locationName: 'Viman Nagar International Airport Zone', lat: 18.5679, lon: 73.9143 },
  { ward: 'Aundh', locationName: 'Aundh Botanical & IT Tech Park Zone', lat: 18.5580, lon: 73.8070 },
  { ward: 'Baner', locationName: 'Baner Bio-Diversity & Smart Transit Hub', lat: 18.5590, lon: 73.7868 }
];

// AI-based Health Advisory Generator based on pollutant thresholds
const generateAiHealthAdvisory = (aqi, pm25, pm10) => {
  if (aqi <= 50) {
    return '🌱 Excellent air quality! Atmosphere is clean and fresh. Perfect for outdoor sports and jogging.';
  } else if (aqi <= 100) {
    return '🍃 Air quality is acceptable. Unusually sensitive individuals should consider limiting prolonged outdoor exertion.';
  } else if (aqi <= 150) {
    return '⚠️ Unhealthy for sensitive groups. Children, elderly, and people with respiratory disease should reduce outdoor exertion.';
  } else if (aqi <= 200) {
    return '🚨 Unhealthy air quality detected! Everyone may begin to experience health effects. Wear N95 masks outdoors.';
  } else if (aqi <= 300) {
    return '🚨 Very Unhealthy! Health alert: everyone may experience more serious health effects. Avoid outdoor activities.';
  } else {
    return '☣️ Hazardous Air Quality Alert! Emergency conditions. Avoid all outdoor activity and keep windows closed.';
  }
};

const getAqiStatus = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

// Fetch real-time live air quality data from Open-Meteo Free Public API
const syncLiveAqiData = async (io = null) => {
  try {
    console.log('🤖 Syncing Live Open-Meteo AI Air Quality Telemetry...');
    const updatedRecords = [];

    for (const item of WARD_COORDINATES) {
      try {
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${item.lat}&longitude=${item.lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,us_aqi`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Failed to fetch for ${item.ward}`);
          continue;
        }

        const data = await response.json();
        const current = data.current || {};

        const rawAqi = current.us_aqi ? Math.round(current.us_aqi) : 65;
        const pm25 = current.pm2_5 ? Math.round(current.pm2_5 * 10) / 10 : 22;
        const pm10 = current.pm10 ? Math.round(current.pm10 * 10) / 10 : 50;
        const no2 = current.nitrogen_dioxide ? Math.round(current.nitrogen_dioxide) : 32;
        const o3 = current.ozone ? Math.round(current.ozone) : 28;
        const co = current.carbon_monoxide ? Math.round((current.carbon_monoxide / 1000) * 10) / 10 : 0.8;

        const status = getAqiStatus(rawAqi);
        const healthAdvisory = generateAiHealthAdvisory(rawAqi, pm25, pm10);

        const updated = await AqiData.findOneAndUpdate(
          { ward: item.ward },
          {
            $set: {
              ward: item.ward,
              locationName: item.locationName,
              aqi: rawAqi,
              pm25,
              pm10,
              no2,
              o3,
              co,
              status,
              healthAdvisory,
              lastUpdated: new Date()
            }
          },
          { upsert: true, new: true }
        );

        updatedRecords.push(updated);
      } catch (err) {
        console.error(`Error syncing ward ${item.ward}:`, err.message);
      }
    }

    if (io && updatedRecords.length > 0) {
      io.emit('aqi_update', updatedRecords);
    }

    console.log(`✅ Live AI AQI Telemetry Synced for ${updatedRecords.length} wards`);
    return updatedRecords;
  } catch (error) {
    console.error('❌ Error in syncLiveAqiData:', error.message);
    throw error;
  }
};

// Automatic background interval runner (every 10 minutes)
let isCronInitialized = false;
const initAqiCron = (io) => {
  if (isCronInitialized) return;
  isCronInitialized = true;

  // Run initial sync on server start
  setTimeout(() => syncLiveAqiData(io), 3000);

  // Repeat every 10 minutes
  setInterval(() => {
    syncLiveAqiData(io);
  }, 10 * 60 * 1000);
};

module.exports = {
  syncLiveAqiData,
  initAqiCron
};
