const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

exports.getStats = async (req, res) => {
  try {
    const [total, pending, progress, resolved, closed, rejected, users, feedbacks] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: 'Closed' }),
      Complaint.countDocuments({ status: 'Rejected' }),
      User.countDocuments(),
      Feedback.countDocuments()
    ]);
    res.json({ total, pending, progress, resolved, closed, rejected, users, feedbacks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
};
