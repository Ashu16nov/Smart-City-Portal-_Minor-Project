const Announcement = require('../models/Announcement');
const NotificationService = require('../services/notificationService');

// 1. Get all published announcements (for citizens)
exports.getPublicAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ status: 'Published' }).sort({ isImportant: -1, publishDate: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// 2. Get all announcements (for admin)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// 3. Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, description, category, isImportant, status, publishDate } = req.body;
    const newAnnouncement = new Announcement({
      title,
      description,
      category,
      isImportant: isImportant || false,
      status: status || 'Published',
      publishDate: publishDate || Date.now()
    });
    const savedAnnouncement = await newAnnouncement.save();

    // Send Global Notification
    const io = req.app.get('socketio');
    await NotificationService.send(io, {
      userId: 'global',
      type: 'Announcement',
      title: isImportant ? `🚨 Important: ${title}` : `📢 New Announcement: ${title}`,
      message: description,
      emailOptions: { to: 'all-users@example.com' }
    });

    res.status(201).json(savedAnnouncement);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create announcement', details: error.message });
  }
};

// 4. Update an announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedAnnouncement) return res.status(404).json({ error: 'Announcement not found' });
    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update announcement', details: error.message });
  }
};

// 5. Delete an announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
    if (!deletedAnnouncement) return res.status(404).json({ error: 'Announcement not found' });
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

// 6. Toggle Important status
exports.toggleImportance = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
    
    announcement.isImportant = !announcement.isImportant;
    await announcement.save();
    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle importance' });
  }
};
