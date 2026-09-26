const SmartParking = require('../models/SmartParking');
const notificationService = require('../services/notificationService');

const seedDefaultParking = async () => {
  const count = await SmartParking.countDocuments();
  if (count === 0) {
    const defaultHubs = [
      {
        spotId: 'PRK-01',
        locationName: 'FC Road Smart Multi-Level Complex',
        address: 'Fergusson College Road, Shivaji Nagar',
        ward: 'Shivaji Nagar',
        totalSlots: 120,
        availableSlots: 42,
        hourlyRate: 30,
        isEVChargingAvailable: true,
        latitude: 18.5204,
        longitude: 73.8567
      },
      {
        spotId: 'PRK-02',
        locationName: 'Kothrud City Mall & Metro Station Parking',
        address: 'Karve Road, Kothrud',
        ward: 'Kothrud',
        totalSlots: 90,
        availableSlots: 18,
        hourlyRate: 20,
        isEVChargingAvailable: true,
        latitude: 18.5074,
        longitude: 73.8077
      },
      {
        spotId: 'PRK-03',
        locationName: 'Viman Nagar IT Hub Parking Lot A',
        address: 'Phoenix Mall Road, Viman Nagar',
        ward: 'Viman Nagar',
        totalSlots: 150,
        availableSlots: 65,
        hourlyRate: 40,
        isEVChargingAvailable: true,
        latitude: 18.5679,
        longitude: 73.9143
      },
      {
        spotId: 'PRK-04',
        locationName: 'Swargate Bus Terminal & Transit Spot',
        address: 'Swargate Flyover Junction',
        ward: 'Swargate',
        totalSlots: 80,
        availableSlots: 8,
        hourlyRate: 25,
        isEVChargingAvailable: false,
        latitude: 18.5018,
        longitude: 73.8636
      }
    ];
    await SmartParking.insertMany(defaultHubs);
    console.log('✅ Default Smart Parking Hubs Seeded successfully');
  }
};

exports.getAllParking = async (req, res) => {
  try {
    await seedDefaultParking();
    const hubs = await SmartParking.find().sort({ availableSlots: -1 });
    res.json({ success: true, count: hubs.length, hubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reserveSpot = async (req, res) => {
  try {
    const { spotId, userId, userName, vehicleNumber, durationHours } = req.body;
    if (!spotId || !userId || !vehicleNumber) {
      return res.status(400).json({ success: false, message: 'spotId, userId, and vehicleNumber are required' });
    }

    const hub = await SmartParking.findOne({ spotId });
    if (!hub) return res.status(404).json({ success: false, message: 'Parking hub not found' });

    if (hub.availableSlots <= 0) {
      return res.status(400).json({ success: false, message: 'Sorry, no available parking slots at this location' });
    }

    const hours = Number(durationHours) || 2;
    const totalAmount = hub.hourlyRate * hours;
    const bookingId = 'PRK-RES-' + Math.floor(100000 + Math.random() * 900000);
    const slotNumber = 'SLOT-' + (hub.totalSlots - hub.availableSlots + 1);

    hub.availableSlots -= 1;
    hub.reservations.push({
      bookingId,
      userId: userId.toString(),
      userName: userName || 'Citizen',
      vehicleNumber,
      slotNumber,
      durationHours: hours,
      totalAmount,
      status: 'Active'
    });

    await hub.save();

    await notificationService.createNotification({
      title: 'Parking Spot Reserved 🅿️',
      message: `Reserved ${slotNumber} at ${hub.locationName} for Vehicle ${vehicleNumber} (${hours} hrs). Booking ID: ${bookingId}.`,
      type: 'success',
      userId: userId.toString(),
      io: req.app.get('socketio')
    });

    res.status(201).json({ 
      success: true, 
      message: 'Parking slot reserved successfully', 
      reservation: {
        bookingId,
        slotNumber,
        locationName: hub.locationName,
        vehicleNumber,
        hourlyRate: hub.hourlyRate,
        totalAmount,
        durationHours: hours
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    const { userId } = req.params;
    const hubs = await SmartParking.find({ 'reservations.userId': userId });
    
    let userReservations = [];
    hubs.forEach(h => {
      h.reservations.forEach(r => {
        if (r.userId === userId) {
          userReservations.push({
            ...r.toObject(),
            locationName: h.locationName,
            address: h.address,
            spotId: h.spotId
          });
        }
      });
    });

    userReservations.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    res.json({ success: true, reservations: userReservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
