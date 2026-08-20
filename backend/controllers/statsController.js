const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Service = require('../models/Service');
const Announcement = require('../models/Announcement');

exports.getStats = async (req, res) => {
  try {
    const [
      total, pending, progress, resolved, closed, rejected, 
      users, feedbacks, services, announcements,
      byCategory, byDepartment, byMonth
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: 'Closed' }),
      Complaint.countDocuments({ status: 'Rejected' }),
      User.countDocuments(),
      Feedback.countDocuments(),
      Service.countDocuments(),
      Announcement.countDocuments(),
      Complaint.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Complaint.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Complaint.aggregate([
        { 
          $group: {
            _id: { $substr: ["$createdAt", 5, 2] }, // Extract MM from YYYY-MM-DD
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Format aggregations
    const analytics = {
      category: byCategory.reduce((acc, curr) => ({ ...acc, [curr._id || 'Unknown']: curr.count }), {}),
      department: byDepartment.reduce((acc, curr) => ({ ...acc, [curr._id || 'Unknown']: curr.count }), {}),
      monthly: byMonth.reduce((acc, curr) => ({ ...acc, [curr._id || 'Unknown']: curr.count }), {})
    };

    res.json({ total, pending, progress, resolved, closed, rejected, users, feedbacks, services, announcements, analytics });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
};
