const mongoose = require('mongoose');

const localBusinessSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Organic Farmers & Kisan Mandi', 'Handicrafts & Artisans', 'Local Services & Tutors', 'Mohali Food & Bakeries', 'IT Startups & Tech Services'],
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  productsOffered: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 4.8
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  badge: {
    type: String,
    default: 'Mohali Verified Local'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LocalBusiness', localBusinessSchema);
