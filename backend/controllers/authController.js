const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'MunicipalSuperSecretKey123!@#';
const usersFilePath = path.join(__dirname, '..', 'users.json');

// Helper functions for users.json
const readUsers = () => {
  if (!fs.existsSync(usersFilePath)) return [];
  const data = fs.readFileSync(usersFilePath);
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

exports.signup = async (req, res) => {
  try {
    const { name, username, password, email, phone } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ error: 'Name, username and password are required' });

    const users = readUsers();
    const exists = users.find(u => u.username === username || u.email === email);
    if (exists) return res.status(409).json({ error: 'Username or email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}`;
    const newUser = {
      _id: userId,
      id: userId,
      name,
      username,
      password: hashedPassword,
      email: email || '',
      phone: phone || '',
      role: 'user'
    };

    users.push(newUser);
    writeUsers(users);

    const token = jwt.sign({ userId: newUser._id, id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ message: 'Account created', token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = readUsers();
    
    const user = users.find(u => u.username === username || u.email === username);
    
    if (!user) return res.status(401).json({ error: 'User not found. Please signup first.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password.' });

    const token = jwt.sign({ userId: user._id, id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ message: 'Login successful', token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};
