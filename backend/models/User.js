const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'staff'], default: 'user' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model('User', userSchema);
