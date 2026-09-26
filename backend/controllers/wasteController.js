const WastePickup = require('../models/WastePickup');
const notificationService = require('../services/notificationService');

// Official Mohali (SAS Nagar, Punjab) Recycling & Collection Centers Directory
const recyclingCenters = [
  { id: 'RC-01', name: 'Central E-Waste Recycling Hub', area: 'Industrial Area Phase 8, Mohali', contact: '0172-2270088', openHours: '9:00 AM - 6:00 PM', address: 'Plot 88, Industrial Area Phase 8, Mohali' },
  { id: 'RC-02', name: 'Green Earth Bio-Waste Composting Depot', area: 'Sector 70, Mohali', contact: '0172-2270070', openHours: '8:00 AM - 5:00 PM', address: 'Near Sector 70 Municipal Depot, Mohali' },
  { id: 'RC-03', name: 'Eco-Smart Plastic Processing Center', area: 'Phase 1, Mohali', contact: '0172-2270011', openHours: '9:30 AM - 7:00 PM', address: 'Industrial Zone Phase 1, Mohali' },
  { id: 'RC-04', name: 'Phase 3B2 Citizen Recycling Drop-Off Spot', area: 'Phase 3B2, Mohali', contact: '0172-2270032', openHours: '10:00 AM - 6:00 PM', address: 'Opposite Phase 3B2 Main Market, Mohali' }
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
      ward: ward || 'Phase 7 Mohali',
      wasteType,
      preferredDate,
      preferredSlot,
      notes,
      ecoPointsEarned: points
    });

    await newPickup.save();

    await notificationService.createNotification({
      title: 'Waste Pickup Scheduled 🗑️',
      message: `Your pickup request ${requestId} for ${wasteType} in Mohali has been scheduled for ${preferredDate}.`,
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
        message: `Your waste pickup ${pickup.requestId} in Mohali is complete! You earned ${pickup.ecoPointsEarned} Eco-Points.`,
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
