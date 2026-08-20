const Complaint = require('../models/Complaint');
const NotificationService = require('../services/notificationService');

// Helper to generate unique Complaint ID
const generateComplaintId = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CMP${timestamp}${random}`;
};

exports.getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') {
      query = { userId: req.user.userId };
    } else if (req.user.role === 'department') {
      query = { assignedDepartmentId: req.user.id };
    } else if (req.user.role === 'staff') {
      query = { assignedStaffId: req.user.id };
    }
    // Admin gets all complaints (query = {})

    const complaints = await Complaint.find(query)
      .select('-image')
      .sort({ _id: -1 })
      .limit(100);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

exports.getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.params.userId })
      .select('-image')
      .sort({ _id: -1 })
      .limit(100);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user history' });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaint details' });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const User = require('../models/User');
    const userObj = await User.findById(req.user.userId);
    const complaintId = generateComplaintId();
    
    // 1. Priority Logic
    const text = `${req.body.category} ${req.body.title} ${req.body.description}`.toLowerCase();
    let priority = 'Medium';
    if (text.match(/leakage|fire|damage|safety|danger|emergency|hazard|severe|critical|urgent/)) {
      priority = 'High';
    } else if (text.match(/minor|suggestion|feedback|query/)) {
      priority = 'Low';
    }

    // 2. SLA Logic
    const slaDays = priority === 'High' ? 1 : priority === 'Medium' ? 3 : 7;
    const slaDeadline = new Date();
    slaDeadline.setDate(slaDeadline.getDate() + slaDays);

    // 3. Auto-Routing Logic
    // E.g., if category is "Road", look for a Department named "Road Department" or containing "Road"
    const dept = await User.findOne({ role: 'department', name: new RegExp(req.body.category, 'i') });
    let assignedDepartmentId = undefined;
    let initialStatus = 'Submitted';
    
    if (dept) {
      assignedDepartmentId = dept._id.toString();
      initialStatus = 'Assigned'; // Automatically skip to Assigned
    }

    const complaint = await Complaint.create({
      ...req.body,
      complaintId,
      userId: req.user.userId,
      userName: userObj ? userObj.name : 'Citizen',
      status: initialStatus,
      priority,
      slaDeadline,
      assignedDepartmentId,
      history: [{ status: initialStatus, changedBy: 'Citizen' }]
    });

    // Real-time update via Socket.io
    const io = req.app.get('socketio');
    io.emit('new_complaint', complaint);

    // Send Notification
    await NotificationService.send(io, {
      userId: req.user.userId,
      type: 'Complaint',
      title: 'Complaint Submitted',
      message: `Your complaint (${complaintId}) regarding ${req.body.category} has been submitted successfully.`,
      emailOptions: { to: 'user@example.com' } // Mocked
    });

    res.status(201).json(complaint);
  } catch (err) {
    console.error("COMPLAINT CREATE ERROR:", err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const idParam = req.params.complaintId;
    const mongoose = require('mongoose');
    const isObjectId = mongoose.Types.ObjectId.isValid(idParam) && idParam.length === 24;
    
    const query = isObjectId 
      ? { $or: [{ complaintId: idParam }, { _id: idParam }] }
      : { complaintId: idParam };

    const updateData = { $set: { ...req.body } };
    
    if (req.body.status) {
      updateData.$push = {
        history: {
          status: req.body.status,
          changedBy: req.user ? (req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)) : 'System'
        }
      };
    }

    const updated = await Complaint.findOneAndUpdate(
      query,
      updateData,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Complaint not found' });

    // Real-time update
    const io = req.app.get('socketio');
    io.emit('status_update', updated);

    // Send Notification if status changed
    if (req.body.status) {
      await NotificationService.send(io, {
        userId: updated.userId,
        type: 'Complaint',
        title: `Complaint ${req.body.status}`,
        message: `Your complaint (${updated.complaintId}) status has been updated to ${req.body.status}.`,
        emailOptions: { to: 'user@example.com' }
      });
    }

    res.json({ message: 'Updated successfully', complaint: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    await Complaint.findOneAndDelete({ complaintId: req.params.id });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
};

exports.purgeComplaints = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await Complaint.deleteMany({});
    res.json({ message: 'All complaints purged from database.' });
  } catch (err) {
    res.status(500).json({ error: 'Purge failed' });
  }
};
