const Complaint = require('../models/Complaint');

// Helper to generate unique Complaint ID
const generateComplaintId = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CMP${timestamp}${random}`;
};

exports.getComplaints = async (req, res) => {
  try {
    console.log(`🔍 Fetching complaints for role: ${req.user.role}, userId: ${req.user.userId}`);
    const query = req.user.role === 'admin' ? {} : { userId: req.user.userId };
    const complaints = await Complaint.find(query)
      .select('-image')
      .sort({ _id: -1 })
      .limit(100);
    console.log(`📊 Found ${complaints.length} complaints`);
    res.json(complaints);
  } catch (err) {
    console.error('❌ Error fetching complaints:', err);
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
    const complaint = await Complaint.create({
      ...req.body,
      complaintId,
      userId: req.user.userId,
      userName: userObj ? userObj.name : 'Citizen',
      status: 'Pending'
    });

    // Real-time update via Socket.io
    const io = req.app.get('socketio');
    io.emit('new_complaint', complaint);

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

    const updated = await Complaint.findOneAndUpdate(
      query,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Complaint not found' });

    // Real-time update
    const io = req.app.get('socketio');
    io.emit('status_update', updated);

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
