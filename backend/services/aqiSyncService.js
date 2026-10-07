const AqiData = require('../models/AqiData');

// Official Mohali (SAS Nagar, Punjab) Ward Geo-Coordinates Map for Live Open-Meteo AI Telemetry
const WARD_COORDINATES = [
  { ward: 'Phase 7 Mohali', locationName: 'Phase 7 Main Commercial & Transit Hub, Mohali', lat: 30.7046, lon: 76.7179 },
  { ward: 'Phase 3B2 Mohali', locationName: 'Phase 3B2 Sector Market & Food Hub, Mohali', lat: 30.7093, lon: 76.7262 },
  { ward: 'Sector 70 Mohali', locationName: 'Sector 70 Administrative & Residential Zone, Mohali', lat: 30.6974, lon: 76.7214 },
  { ward: 'Phase 10 Mohali', locationName: 'Phase 10 PCA Stadium & Sports Sector, Mohali', lat: 30.6865, lon: 76.7329 },
  { ward: 'Industrial Area Phase 8', locationName: 'Industrial Area Phase 8 IT & Tech Park, Mohali', lat: 30.6775, lon: 76.7380 },
  { ward: 'Aerocity IT City', locationName: 'Aerocity International Airport Corridor, Mohali', lat: 30.6482, lon: 76.7909 }
];

// AI-based Health Advisory Generator based on pollutant thresholds
const generateAiHealthAdvisory = (aqi, pm25, pm10) => {
  if (aqi <= 50) {
    return '🌱 Excellent air quality across Mohali! Atmosphere is clean and fresh. Ideal for outdoor exercise and park walks.';
  } else if (aqi <= 100) {
    return '🍃 Air quality in Mohali is moderate. Unusually sensitive individuals should consider limiting prolonged outdoor exertion.';
  } else if (aqi <= 150) {
    return '⚠️ Unhealthy for sensitive groups. Children, elderly, and those with respiratory issues should reduce outdoor activity.';
  } else if (aqi <= 200) {
    return '🚨 Unhealthy air quality detected! Wear N95 masks outdoor across Mohali sectors.';
  } else if (aqi <= 300) {
    return '🚨 Very Unhealthy! Serious atmospheric smog alert for SAS Nagar. Avoid outdoor sports.';
  } else {
    return '☣️ Hazardous Air Quality Alert! Emergency conditions in Mohali. Keep windows closed and stay indoors.';
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

// Fetch real-time live air quality data from Open-Meteo Free Public API for Mohali
const syncLiveAqiData = async (io = null) => {
  try {
    console.log('🤖 Syncing Live Open-Meteo AI Air Quality Telemetry for Mohali, Punjab...');
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

        // Generate Traffic Data (AI/Mock based on time of day and random jitter)
        const hour = new Date().getHours();
        const baseCongestion = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20) ? 6 : 2; // Rush hours
        const randomJitter = Math.floor(Math.random() * 4);
        let trafficCongestionIndex = baseCongestion + randomJitter;
        if (trafficCongestionIndex > 10) trafficCongestionIndex = 10;
        
        let trafficStatus = 'Clear';
        if (trafficCongestionIndex >= 8) trafficStatus = 'Gridlock';
        else if (trafficCongestionIndex >= 6) trafficStatus = 'Heavy';
        else if (trafficCongestionIndex >= 4) trafficStatus = 'Slow';

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
              trafficCongestionIndex,
              trafficStatus,
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

    console.log(`✅ Live AI AQI Telemetry Synced for ${updatedRecords.length} Mohali sectors`);
    return updatedRecords;
  } catch (error) {
    console.error('❌ Error in syncLiveAqiData:', error.message);
    throw error;
  }
};

let isCronInitialized = false;
const initAqiCron = (io) => {
  if (isCronInitialized) return;
  isCronInitialized = true;

  setTimeout(() => syncLiveAqiData(io), 2000);

  setInterval(() => {
    syncLiveAqiData(io);
  }, 10 * 60 * 1000);
};

module.exports = {
  syncLiveAqiData,
  initAqiCron
};
