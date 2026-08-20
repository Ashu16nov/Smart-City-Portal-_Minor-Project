const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');

exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    // Fetch user-specific notifications and global announcements
    const notifications = await Notification.find({
      $or: [{ userId: userId }, { userId: 'global' }]
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { $or: [{ userId: userId }, { userId: 'global' }], isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
};

exports.sendBroadcast = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { type, title, message, target } = req.body;
    // target can be 'global' or a specific userId. We default to 'global' for broadcasts.
    const io = req.app.get('socketio');

    await NotificationService.send(io, {
      userId: target || 'global',
      type: type || 'System',
      title,
      message,
      emailOptions: { to: 'all-users@example.com' }, // Mock bulk email
    });

    res.json({ message: 'Broadcast sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
};
