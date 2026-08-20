const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
require('dotenv').config();
const Announcement = require('./models/Announcement');

const announcements = [
  {
    title: 'Scheduled Maintenance for RO Plant',
    description: 'The Central RO Plant will undergo routine maintenance and filter replacement tomorrow from 10:00 AM to 2:00 PM. Please store drinking water accordingly.',
    category: 'Maintenance',
    isImportant: true,
    status: 'Published'
  },
  {
    title: 'Upcoming RWA Annual General Meeting',
    description: 'The Annual General Meeting for Ambika Green Phase 1 will be held at the Clubhouse on Sunday at 11:00 AM. All flat owners are requested to attend.',
    category: 'RWA Notice',
    isImportant: true,
    status: 'Published'
  },
  {
    title: 'New Visitor Management System',
    description: 'We are upgrading to a new app-based visitor management system at the main gate. Please download the MyGate app and register using your flat number.',
    category: 'Security Alert',
    isImportant: false,
    status: 'Published'
  },
  {
    title: 'Weekend Yoga Classes at Central Park',
    description: 'Free yoga classes for all age groups will commence this weekend at the Central Park. Bring your own mats! Timings: 6:30 AM to 7:30 AM.',
    category: 'Events',
    isImportant: false,
    status: 'Published'
  },
  {
    title: 'Temporary Power Outage - Block B',
    description: 'Due to electrical panel repairs, Block B will experience a brief power interruption between 3 PM and 4 PM today.',
    category: 'Power/Water Interruption',
    isImportant: true,
    status: 'Published'
  }
];

async function seedAnnouncements() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    await Announcement.deleteMany({});
    console.log('🗑️ Cleared existing announcements.');

    await Announcement.insertMany(announcements);
    console.log(`🎉 Successfully seeded ${announcements.length} announcements!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding announcements:', error);
    process.exit(1);
  }
}

seedAnnouncements();
