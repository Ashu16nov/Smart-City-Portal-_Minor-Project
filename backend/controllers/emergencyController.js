const EmergencyContact = require('../models/EmergencyContact');
const EmergencyReport = require('../models/EmergencyReport');

// ─── Emergency Contacts ──────────────────────────────────────────────────────

// Get all active emergency contacts (Public/Citizen)
exports.getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ isActive: true });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch emergency contacts' });
  }
};

// Admin: Get all emergency contacts (including inactive)
exports.getAllContactsAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const contacts = await EmergencyContact.find({});
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all contacts' });
  }
};

// Admin: Add new emergency contact
exports.addContact = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { title, contactNumber, category, location, instructions } = req.body;
    
    if (!title || !contactNumber || !category) {
      return res.status(400).json({ error: 'Title, contact number, and category are required' });
    }

    const contact = new EmergencyContact({ title, contactNumber, category, location, instructions });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add contact' });
  }
};

// Admin: Update emergency contact
exports.updateContact = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { title, contactNumber, category, location, instructions, isActive } = req.body;
    
    const contact = await EmergencyContact.findByIdAndUpdate(
      req.params.id,
      { title, contactNumber, category, location, instructions, isActive },
      { new: true }
    );
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

// Admin: Delete emergency contact
exports.deleteContact = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const contact = await EmergencyContact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};

// ─── Emergency Reports ───────────────────────────────────────────────────────

// Citizen: Report an emergency
exports.reportEmergency = async (req, res) => {
  try {
    const { emergencyType, location, description } = req.body;
    if (!emergencyType || !location || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const report = new EmergencyReport({
      citizenId: req.user.id || req.user.userId,
      emergencyType,
      location,
      description
    });
    
    await report.save();
    
    // Notify admins via socket if connected
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_emergency', report);
    }

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit emergency report' });
  }
};

// Admin: Get all emergency reports
exports.getReports = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const reports = await EmergencyReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch emergency reports' });
  }
};

// Admin: Update emergency report status
exports.updateReportStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { status } = req.body;
    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await EmergencyReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report status' });
  }
};
