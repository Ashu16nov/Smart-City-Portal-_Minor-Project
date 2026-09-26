const WastePickup = require('../models/WastePickup');
const notificationService = require('../services/notificationService');

// Static Recycling / E-Waste collection centers directory
const recyclingCenters = [
  { id: 'RC-01', name: 'Central E-Waste Recycling Hub', area: 'Shivaji Nagar', contact: '020-25531000', openHours: '9:00 AM - 6:00 PM', address: 'Plot 45, Model Colony Industrial Area' },
  { id: 'RC-02', name: 'Green Earth Bio-Waste Composting Plant', area: 'Kothrud', contact: '020-25442111', openHours: '8:00 AM - 5:00 PM', address: 'Near DP Road Garbage Depot, Kothrud' },
  { id: 'RC-03', name: 'Eco-Smart Plastic Processing Center', area: 'Hadapsar', contact: '020-26870022', openHours: '9:30 AM - 7:00 PM', address: 'Sector 3, Hadapsar Industrial Estate' },
  { id: 'RC-04', name: 'Viman Nagar Citizen Recycling & Drop-Off Spot', area: 'Viman Nagar', contact: '020-26639988', openHours: '10:00 AM - 6:00 PM', address: 'Opposite Symbiosis Gate 2, Viman Nagar' }
];

exports.getPickups = async (req, res) => {
  try {
    const { userId, role } = req.query;
    let filter = {};
    if (role !== 'admin' && role !== 'staff' && userId) {
      filter.userId = userId;
    }
    const pickups = await WastePickup.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: pickups.length, pickups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestPickup = async (req, res) => {
  try {
    const { userId, userName, userPhone, address, ward, wasteType, preferredDate, preferredSlot, notes } = req.body;
    
    if (!userId || !address || !ward || !wasteType || !preferredDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required pickup fields' });
    }

    const requestId = 'WST' + Math.floor(100000 + Math.random() * 900000);
    
    // Eco points baseline calculation by waste type
    let points = 20;
    if (wasteType.includes('E-Waste')) points = 50;
    else if (wasteType.includes('Hazardous')) points = 40;
    else if (wasteType.includes('Recyclable')) points = 30;

    const newPickup = new WastePickup({
      requestId,
      userId,
      userName,
      userPhone,
      address,
      ward,
      wasteType,
      preferredDate,
      preferredSlot,
      notes,
      ecoPointsEarned: points
    });

    await newPickup.save();

    // Trigger notification via notificationService
    await notificationService.createNotification({
      title: 'Waste Pickup Scheduled 🗑️',
      message: `Your pickup request ${requestId} for ${wasteType} has been scheduled for ${preferredDate}.`,
      type: 'info',
      userId: userId.toString(),
      io: req.app.get('socketio')
    });

    res.status(201).json({ success: true, message: 'Waste pickup requested successfully', pickup: newPickup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pickup = await WastePickup.findById(id);
    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup request not found' });

    pickup.status = status;
    await pickup.save();

    if (status === 'Completed') {
      await notificationService.createNotification({
        title: 'Pickup Completed 🎉',
        message: `Your waste pickup ${pickup.requestId} is complete! You earned ${pickup.ecoPointsEarned} Eco-Points.`,
        type: 'success',
        userId: pickup.userId.toString(),
        io: req.app.get('socketio')
      });
    }

    res.json({ success: true, pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecyclingCenters = (req, res) => {
  res.json({ success: true, centers: recyclingCenters });
};
