// ─── DNS Override ────────
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5005;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 20000,
  family: 4,
};

function connectWithRetry(retries = 5, delay = 3000) {
  mongoose
    .connect(process.env.MONGO_URI, MONGO_OPTIONS)
    .then(() => console.log('✅ MongoDB Atlas connected successfully'))
    .catch(err => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
      if (retries > 0) {
        console.log(`   ↪ Retrying in ${delay / 1000}s… (${retries} attempts left)`);
        setTimeout(() => connectWithRetry(retries - 1, delay), delay);
      }
    });
}

connectWithRetry();

// ─── Seed Default Admin ──────────────────────────────────────────────────────
const User = require('./models/User');
async function seedUsers() {
  try {
    // 1. Seed Admin
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        id: 'admin-001',
        name: 'Municipal Admin',
        username: 'admin',
        password: hashedAdminPassword,
        email: 'admin@pmc.gov.in',
        phone: '0000000000',
        role: 'admin'
      });
      console.log('✅ Default admin seeded (admin / Admin@123)');
    }

    // 2. Seed User Ashu
    const ashuExists = await User.findOne({ username: 'Ashu' });
    if (!ashuExists) {
      const hashedUserPassword = await bcrypt.hash('Test@123', 10);
      await User.create({
        id: 'user-001',
        name: 'Ashu',
        username: 'Ashu',
        password: hashedUserPassword,
        email: 'ashu@example.com',
        phone: '9876543210',
        role: 'user'
      });
      console.log('✅ Default user seeded (Ashu / Test@123)');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}
mongoose.connection.once('open', seedUsers);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));

// ─── Start ───────────────────────────────────────────────────────────────────
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Attach io to app so controllers can access it
app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Backend is active at port ${PORT}`);
});
