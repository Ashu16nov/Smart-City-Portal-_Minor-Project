const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '..', 'users.json');

const readUsers = () => {
  if (!fs.existsSync(usersFilePath)) return [];
  const data = fs.readFileSync(usersFilePath);
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Admin: Create Staff Account
exports.createStaff = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { name, username, email, password, department } = req.body;
    if (!name || !username || !password || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const users = readUsers();
    const exists = users.find(u => u.username === username || (email && u.email === email));
    if (exists) return res.status(409).json({ error: 'Username or email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `staff-${Date.now()}`;
    const newUser = {
      _id: userId,
      id: userId,
      name,
      username,
      password: hashedPassword,
      email: email || '',
      phone: '',
      role: 'staff',
      department,
      createdAt: new Date().toISOString(),
      isActive: true,
      notifications: { email: true, sms: false }
    };

    users.push(newUser);
    writeUsers(users);

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ message: 'Staff credential generated', user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create staff credential' });
  }
};

// Admin: Get all users
exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    const users = readUsers();
    // Exclude passwords
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Admin: Toggle active status
exports.toggleActiveStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    // Toggle status
    users[userIndex].isActive = !users[userIndex].isActive;
    writeUsers(users);

    res.json({ message: `User account is now ${users[userIndex].isActive ? 'Active' : 'Deactivated'}.`, isActive: users[userIndex].isActive });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Citizen: Update their own profile
exports.updateProfile = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const { name, email, phone, address, city, profilePhoto, notifications } = req.body;
    
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    // Update allowed fields
    const u = users[userIndex];
    if (name) u.name = name;
    if (email) u.email = email;
    if (phone) u.phone = phone;
    if (address !== undefined) u.address = address;
    if (city !== undefined) u.city = city;
    if (profilePhoto !== undefined) u.profilePhoto = profilePhoto;
    if (notifications !== undefined) u.notifications = notifications;

    writeUsers(users);

    const { password: _, ...safeUser } = u;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// Citizen: Change password securely
exports.changePassword = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing password fields' });

    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, users[userIndex].password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect old password' });

    users[userIndex].password = await bcrypt.hash(newPassword, 10);
    writeUsers(users);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};
