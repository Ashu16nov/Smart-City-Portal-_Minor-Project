const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function seedNow() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // 1. Admin
    const hashedAdmin = await bcrypt.hash('Admin@123', 10);
    await User.findOneAndUpdate(
      { username: 'admin' },
      {
        $setOnInsert: { id: 'admin-001', name: 'Municipal Admin', email: 'admin@pmc.gov.in', phone: '0000000000' },
        $set: { password: hashedAdmin, role: 'admin' }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Admin password updated to Admin@123');

    // 2. Staff
    const hashedStaff = await bcrypt.hash('Staff@123', 10);
    await User.findOneAndUpdate(
      { username: 'staff' },
      {
        $setOnInsert: { id: 'staff-001', name: 'Municipal Staff', email: 'staff@pmc.gov.in', phone: '1111111111' },
        $set: { password: hashedStaff, role: 'staff' }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Staff password updated to Staff@123');

    // 3. Citizen (Ashu)
    const hashedUser = await bcrypt.hash('Test@123', 10);
    await User.findOneAndUpdate(
      { username: 'Ashu' },
      {
        $setOnInsert: { id: 'user-001', name: 'Ashu', email: 'ashu@example.com', phone: '9876543210' },
        $set: { password: hashedUser, role: 'user' }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Citizen (Ashu) password updated to Test@123');

    console.log('🎉 All default credentials successfully injected into the database!');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

seedNow();
