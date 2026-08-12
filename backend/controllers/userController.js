const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const { password, ...updates } = req.body;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findOneAndUpdate({ id: req.params.id }, { $set: updates }, { new: true });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...safeUser } = updated.toObject();
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};
