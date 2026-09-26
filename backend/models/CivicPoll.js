const mongoose = require('mongoose');

const civicPollSchema = new mongoose.Schema({
  pollId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Infrastructure', 'Parks & Greenery', 'Renewable Energy', 'Transit & Mobility', 'Digital Smart City'], 
    default: 'Infrastructure' 
  },
  allocatedBudget: { type: String, default: '₹ 50 Lakhs' },
  ward: { type: String, default: 'City-wide' },
  options: [{
    optionId: { type: String, required: true },
    text: { type: String, required: true },
    votesCount: { type: Number, default: 0 }
  }],
  votedUsers: [{
    userId: { type: String, required: true },
    optionId: { type: String, required: true },
    votedAt: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['Active', 'Closed', 'Approved for Execution'], 
    default: 'Active' 
  },
  endDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('CivicPoll', civicPollSchema);
