const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Send a notification
   * @param {Object} io - Socket.io instance
   * @param {Object} params - Notification parameters
   * @param {String} params.userId - Target user ID (or 'global')
   * @param {String} params.type - 'Complaint', 'Announcement', 'Account', 'System'
   * @param {String} params.title - Title of notification
   * @param {String} params.message - Body of notification
   * @param {Object} params.emailOptions - Options for mocked email { to: string }
   * @param {Object} params.smsOptions - Options for mocked SMS { phone: string }
   */
  static async send(io, { userId, type, title, message, emailOptions, smsOptions }) {
    try {
      // 1. Save to Database
      const notification = await Notification.create({
        userId,
        type,
        title,
        message
      });

      // 2. Emit Real-time WebSocket Event
      if (io) {
        if (userId === 'global') {
          io.emit('receiveNotification', notification);
        } else {
          // In a real app, users would join a room with their userId
          // For simplicity here, we'll emit to a specific event format or broadcast
          io.emit(`receiveNotification_${userId}`, notification);
        }
      }

      // 3. Mock Email Notification
      if (emailOptions && emailOptions.to) {
        console.log(`\n📧 [EMAIL SENT to ${emailOptions.to}]`);
        console.log(`Subject: ${title}`);
        console.log(`Body: ${message}\n`);
      }

      // 4. Mock SMS Notification
      if (smsOptions && smsOptions.phone) {
        console.log(`\n📱 [SMS SENT to ${smsOptions.phone}]`);
        console.log(`Message: ${title} - ${message}\n`);
      }

      return notification;
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }
  }
}

module.exports = NotificationService;
