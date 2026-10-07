const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['RWA Notice', 'Maintenance', 'Power/Water Interruption', 'Events', 'Security Alert', 'Other'],
    required: true 
  },
  isImportant: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['Published', 'Unpublished', 'Draft'], 
    default: 'Published' 
  },
  publishDate: { type: Date, default: Date.now },
  eventDate: { type: Date },
  eventLocation: { type: String },
  maxAttendees: { type: Number },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVolunteering: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', announcementSchema);
