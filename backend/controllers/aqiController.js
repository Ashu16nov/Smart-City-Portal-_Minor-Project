const AqiData = require('../models/AqiData');
const { syncLiveAqiData, initAqiCron } = require('../services/aqiSyncService');

exports.getAllAqi = async (req, res) => {
  try {
    // Initialize background cron if not active
    const io = req.app.get('socketio');
    if (io) initAqiCron(io);

    let data = await AqiData.find().sort({ aqi: -1 });
    if (data.length === 0) {
      data = await syncLiveAqiData(io);
    }

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

exports.triggerLiveSync = async (req, res) => {
  try {
    const io = req.app.get('socketio');
    const updatedData = await syncLiveAqiData(io);
    res.json({ success: true, message: 'Live AI Air Quality Telemetry Synced!', count: updatedData.length, data: updatedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
