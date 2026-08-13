const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'MunicipalSuperSecretKey123!@#';
const usersFilePath = path.join(__dirname, '..', 'users.json');

// In-memory OTP store for development (email -> { otp, expiresAt })
const otpStore = {};

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
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required' });

    const users = readUsers();
    const exists = users.find(u => u.username === username || u.email === email);
    if (exists) return res.status(409).json({ error: 'Username or email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}`;
    const newUser = {
      _id: userId,
      id: userId,
      name: name || username,
      username,
      password: hashedPassword,
      email: email || '',
      phone: phone || '',
      role: 'user',
      // Extended Profile Fields
      address: '',
      city: '',
      profilePhoto: '',
      createdAt: new Date().toISOString(),
      isActive: true,
      notifications: {
        email: true,
        sms: true
      }
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
    if (!user.isActive) return res.status(403).json({ error: 'Your account has been deactivated by an Administrator.' });

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

// Password Recovery Flows
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).json({ error: 'No account associated with this email.' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    };

    // Print OTP to terminal for dev purposes
    console.log(`\n\n[DEV NOTIFICATION] OTP for ${email} is: ${otp}\n\n`);

    res.json({ message: 'OTP sent successfully (Check server console)' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process forgot password request.' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) return res.status(400).json({ error: 'No OTP request found for this email.' });
    if (Date.now() > record.expiresAt) return res.status(400).json({ error: 'OTP has expired.' });
    if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP.' });

    res.json({ message: 'OTP Verified successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify OTP.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = otpStore[email];

    if (!record || record.otp !== otp) return res.status(400).json({ error: 'Invalid or expired OTP session.' });

    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    writeUsers(users);

    delete otpStore[email]; // Clear OTP
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};
