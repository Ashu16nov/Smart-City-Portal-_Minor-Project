const Feedback = require('../models/Feedback');

exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save feedback' });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const updated = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update feedback status' });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
};

exports.purgeFeedbacks = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await Feedback.deleteMany({});
    res.json({ message: 'All feedback logs purged from database.' });
  } catch (err) {
    res.status(500).json({ error: 'Purge failed' });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    
    const total = feedbacks.length;
    const suggestionsCount = feedbacks.filter(f => f.type === 'Suggestion').length;
    const feedbackCount = total - suggestionsCount;
    
    // Average rating
    const rated = feedbacks.filter(f => f.type === 'Feedback' && f.rating);
    const avgRating = rated.length > 0 
      ? (rated.reduce((acc, curr) => acc + parseInt(curr.rating), 0) / rated.length).toFixed(1) 
      : 0;

    // Categories Breakdown
    const categories = {};
    feedbacks.forEach(f => {
      const cat = f.component || 'Unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    res.json({
      total,
      feedbackCount,
      suggestionsCount,
      avgRating,
      categories
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
};
