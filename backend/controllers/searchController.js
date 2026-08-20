const Complaint = require('../models/Complaint');
const Service = require('../models/Service');
const Announcement = require('../models/Announcement');

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ complaints: [], services: [], announcements: [] });

    const regex = new (require('mongoose').mongo.BSONRegExp)(q, 'i'); // safe regex search

    const [complaints, services, announcements] = await Promise.all([
      Complaint.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { complaintId: { $regex: q, $options: 'i' } }
        ]
      }).limit(5).select('complaintId title status'),
      
      Service.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      }).limit(5),
      
      Announcement.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ]
      }).limit(5)
    ]);

    res.json({ complaints, services, announcements });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to perform search' });
  }
};
