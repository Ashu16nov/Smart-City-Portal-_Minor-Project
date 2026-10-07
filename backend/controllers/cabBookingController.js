const CabBooking = require('../models/CabBooking');
const User = require('../models/User');

const CAB_RATES = {
  'Mini': { baseFare: 40, perKmRate: 12 },
  'Sedan': { baseFare: 50, perKmRate: 15 },
  'SUV': { baseFare: 70, perKmRate: 18 },
  'Metro Ticket': { baseFare: 20, perKmRate: 2 },
  'Bus Pass': { baseFare: 500, perKmRate: 0 } // Flat rate for a pass
};

const cabBookingController = {
  createBooking: async (req, res) => {
    try {
      const { pickup, destination, distance, cabType, transportMode, isPass, routeId } = req.body;
      const userId = req.user.id; 

      if (!pickup || !destination || distance === undefined || !cabType) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      if (pickup.toLowerCase() === destination.toLowerCase()) {
        return res.status(400).json({ error: 'Pickup and destination cannot be the same.' });
      }

      const rateInfo = CAB_RATES[cabType];
      if (!rateInfo) {
        return res.status(400).json({ error: 'Invalid cab type.' });
      }

      const { baseFare, perKmRate } = rateInfo;
      // Backend Validation of Fare
      const calculatedTotalFare = Math.round(baseFare + (distance * perKmRate));

      // Generate Unique Booking ID
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const bookingId = `CAB-${new Date().getFullYear()}-${randomNum}`;

      // Mock Driver Assignment
      const driver = {
        name: 'Rahul Sharma',
        vehicle: cabType,
        vehicleNumber: `PB65AB${Math.floor(1000 + Math.random() * 9000)}`
      };

      const newBooking = new CabBooking({
        bookingId,
        user: userId,
        pickup,
        destination,
        distance,
        cabType,
        baseFare,
        perKmRate,
        totalFare: calculatedTotalFare,
        status: 'BOOKED',
        transportMode: transportMode || 'Cab',
        isPass: isPass || false,
        routeId: routeId || '',
        driver: transportMode === 'Cab' || !transportMode ? driver : undefined
      });

      await newBooking.save();

      // Trigger socket event for booking
      const io = req.app.get('socketio');
      if (io) {
        io.emit(`receiveNotification_${userId}`, {
          title: 'Cab Booked Successfully',
          message: `Booking ID: ${bookingId}. Your cab is confirmed.`
        });
      }

      res.status(201).json({ message: 'Booking successful', booking: newBooking });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  },

  getMyBookings: async (req, res) => {
    try {
      const userId = req.user.id;
      const bookings = await CabBooking.find({ user: userId }).sort({ createdAt: -1 });
      res.status(200).json(bookings);
    } catch (error) {
      console.error('Fetch bookings error:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  },

  getBookingById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const booking = await CabBooking.findOne({ _id: id, user: userId });
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      res.status(200).json(booking);
    } catch (error) {
      console.error('Fetch booking error:', error);
      res.status(500).json({ error: 'Failed to fetch booking' });
    }
  },

  cancelBooking: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const booking = await CabBooking.findOne({ _id: id, user: userId });
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
        return res.status(400).json({ error: `Cannot cancel a booking that is already ${booking.status}` });
      }

      booking.status = 'CANCELLED';
      await booking.save();

      // Trigger socket event
      const io = req.app.get('socketio');
      if (io) {
        io.emit(`receiveNotification_${userId}`, {
          title: 'Booking Cancelled',
          message: `Booking ${booking.bookingId} was cancelled successfully.`
        });
      }

      res.status(200).json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  }
};

module.exports = cabBookingController;
