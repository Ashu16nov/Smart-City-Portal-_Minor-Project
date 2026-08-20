const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Admin: Create Department Head or Staff Account
exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { name, username, email, password, role, departmentName } = req.body;
    if (!name || !username || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(409).json({ error: 'Username or email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `${role}-${Date.now()}`;
    
    const newUser = await User.create({
      id: userId,
      name,
      username,
      password: hashedPassword,
      email: email || '',
      phone: '',
      role, // 'department' or 'staff'
      departmentName: departmentName || '',
      isActive: true
    });

    const { password: _, ...safeUser } = newUser.toObject();
    res.status(201).json({ message: 'Credential generated', user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create credential' });
  }
};

// Admin/Department: Get all users
exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'department') return res.status(403).json({ error: 'Access denied' });
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Admin: Toggle active status
exports.toggleActiveStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User account is now ${user.isActive ? 'Active' : 'Deactivated'}.`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// User: Update their own profile
exports.updateProfile = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const { name, email, phone, address, city, profilePhoto, notifications } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (notifications !== undefined) updateData.notifications = notifications;

    const user = await User.findOneAndUpdate({ id: req.params.id }, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// User: Change password securely
exports.changePassword = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing password fields' });

    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect old password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};
