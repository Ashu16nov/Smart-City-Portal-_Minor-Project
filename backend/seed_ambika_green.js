const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./models/Service');
const EmergencyContact = require('./models/EmergencyContact');

const servicesData = [
  // 1. Water Supply
  {
    name: 'Ambika Green Central RO Plant',
    category: 'Water Supply',
    description: 'Society managed drinking water facility.',
    detailedDescription: 'Provides 24/7 RO purified drinking water to all residential blocks in Phase 1. Maintained daily by the estate management.',
    location: 'Ambika Green Phase 1',
    address: 'Near Block C, Ambika Green Phase 1, Mohali',
    contactNumber: 'Ext: 201',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['TDS Monitoring', 'Monthly Cleaning'],
    servicesOffered: ['Drinking Water Supply'],
    complaintType: 'Water Supply'
  },
  {
    name: 'Mohali Municipal Water Supply',
    category: 'Water Supply',
    description: 'Primary water connection for non-drinking usage.',
    detailedDescription: 'Supplies municipal water to the society underground tanks every morning and evening.',
    location: 'Mohali',
    address: 'Municipal Corporation, Sector 68, Mohali',
    contactNumber: '1800-180-2051',
    workingHours: 'Morning 6-8 AM, Evening 5-7 PM',
    status: 'Available',
    complaintType: 'Water Supply'
  },
  
  // 2. Electricity
  {
    name: 'Phase 1 DG Backup Room',
    category: 'Electricity',
    description: 'Society 100% power backup generators.',
    detailedDescription: 'Three heavy-duty diesel generators providing seamless auto-switch power backup during municipal power cuts.',
    location: 'Ambika Green Phase 1',
    address: 'Utility Block, Behind Clubhouse',
    contactNumber: 'Ext: 202',
    workingHours: '24x7 Auto-switch',
    status: 'Available',
    facilities: ['Auto Switchover', 'Pre-paid Metering Integration'],
    complaintType: 'Electricity'
  },
  {
    name: 'PSPCL Mohali Office',
    category: 'Electricity',
    description: 'Punjab State Power Corporation Limited.',
    location: 'Mohali',
    address: 'Phase 1, Industrial Area, Mohali',
    emergencyPhone: '1912',
    workingHours: '24x7 Fault Center',
    status: 'Available',
    complaintType: 'Electricity'
  },

  // 3. Waste Management
  {
    name: 'Ambika Housekeeping Services',
    category: 'Waste Management',
    description: 'Daily door-to-door garbage collection.',
    detailedDescription: 'Housekeeping staff collects segregated (dry/wet) waste from each flat daily between 8 AM and 11 AM.',
    location: 'Ambika Green Phase 1',
    contactNumber: 'Ext: 203',
    workingHours: '8:00 AM - 11:00 AM',
    status: 'Available',
    servicesOffered: ['Door-to-door Collection', 'Common Area Cleaning'],
    complaintType: 'Garbage/Waste'
  },

  // 4. Public Transport
  {
    name: 'Mohali City Bus Stop (Kharar Road)',
    category: 'Public Transport',
    description: 'Nearest CTU local bus stop.',
    location: 'Outside Ambika Green',
    address: 'Kharar - Landran Road, Mohali',
    workingHours: '6:00 AM - 10:00 PM',
    status: 'Available',
    complaintType: 'Public Transport'
  },
  {
    name: 'Society E-Rickshaw Stand',
    category: 'Public Transport',
    description: 'E-rickshaws for last-mile connectivity to main road.',
    location: 'Ambika Green Main Gate',
    workingHours: '6:00 AM - 9:00 PM',
    status: 'Available',
    fees: '₹10 per ride'
  },

  // 5. Hospitals
  {
    name: 'Fortis Hospital Mohali',
    category: 'Hospitals',
    description: 'Nearest Multi-speciality hospital.',
    location: 'Mohali',
    address: 'Sector 62, Phase VIII, Mohali, Punjab 160062',
    contactNumber: '0172-4692222',
    emergencyPhone: '105010',
    workingHours: '24x7 Emergency',
    status: 'Available',
    facilities: ['Trauma Center', 'Ambulance', 'Pharmacy'],
    complaintType: 'Healthcare'
  },
  {
    name: 'Max Super Speciality Hospital',
    category: 'Hospitals',
    description: 'Premium healthcare facility nearby.',
    location: 'Mohali',
    address: 'Phase 6, Mohali, Punjab 160055',
    contactNumber: '0172-5212000',
    workingHours: '24x7',
    status: 'Available'
  },

  // 6. Schools/Colleges
  {
    name: 'Chandigarh Group of Colleges (CGC) Landran',
    category: 'Schools/Colleges',
    description: 'Prominent educational institution near the society.',
    location: 'Landran, Mohali',
    address: 'Landran, Kharar-Banur Hwy, Sector 112, Greater Mohali',
    workingHours: '9:00 AM - 5:00 PM',
    status: 'Open'
  },
  {
    name: 'Ambika Green Play School',
    category: 'Schools/Colleges',
    description: 'In-house playschool and daycare for residents.',
    location: 'Ambika Green Phase 1',
    address: 'Ground Floor, Clubhouse Building',
    contactNumber: 'Ext: 301',
    workingHours: '8:30 AM - 1:30 PM',
    status: 'Open',
    fees: 'Discounted for residents'
  },

  // 7. Government Offices
  {
    name: 'Municipal Corporation Mohali',
    category: 'Government Offices',
    description: 'Local municipal authority office.',
    location: 'Mohali',
    address: 'Sector 68, Sahibzada Ajit Singh Nagar, Punjab 160062',
    contactNumber: '0172-5044907',
    workingHours: '9:00 AM - 5:00 PM',
    status: 'Open'
  },

  // 8. Banks/ATMs
  {
    name: 'HDFC Bank & ATM',
    category: 'Banks/ATMs',
    description: 'Nearest ATM and branch.',
    location: 'Commercial Complex, Outside Gate',
    workingHours: 'Branch: 9:30 AM - 3:30 PM, ATM: 24x7',
    status: 'Available'
  },

  // 9. Police Stations
  {
    name: 'Sohana Police Station',
    category: 'Police Stations',
    description: 'Jurisdictional police station for Ambika Green.',
    location: 'Mohali',
    address: 'Sector 79, Sohana, Mohali',
    emergencyPhone: '112',
    workingHours: '24x7',
    status: 'Available',
    complaintType: 'Public Safety'
  },
  {
    name: 'Ambika Green Main Gate Security',
    category: 'Police Stations', // Classified here for security context
    description: '24x7 armed security at the society entrance.',
    location: 'Ambika Green Phase 1',
    contactNumber: 'Ext: 100',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['CCTV Monitoring', 'Visitor App Verification'],
    complaintType: 'Public Safety'
  },

  // 10. Fire Stations
  {
    name: 'Mohali Fire Station',
    category: 'Fire Stations',
    description: 'City fire department.',
    location: 'Mohali',
    address: 'Phase 1, Industrial Area, Mohali',
    emergencyPhone: '101',
    workingHours: '24x7',
    status: 'Available'
  },
  {
    name: 'Phase 1 Fire Safety System',
    category: 'Fire Stations',
    description: 'In-house fire hydrants and extinguishers.',
    detailedDescription: 'Every floor is equipped with fire extinguishers and a hose reel connected to the dedicated overhead fire tank.',
    location: 'Ambika Green Phase 1',
    workingHours: 'Automated',
    status: 'Available'
  },

  // 11. Parks
  {
    name: 'Ambika Green Central Park',
    category: 'Parks',
    description: 'Lush green central park with walking tracks.',
    location: 'Ambika Green Phase 1',
    workingHours: '5:00 AM - 10:30 PM',
    status: 'Open',
    facilities: ['Jogging Track', 'Open Gym', 'Gazebo']
  },
  {
    name: 'Childrens Play Area',
    category: 'Parks',
    description: 'Safe, rubberized play area for kids.',
    location: 'Ambika Green Phase 1',
    workingHours: '6:00 AM - 9:00 PM',
    status: 'Open',
    facilities: ['Swings', 'Slides', 'Sandpit']
  },

  // 12. Libraries
  {
    name: 'Phase 1 Reading Room',
    category: 'Libraries',
    description: 'Quiet study and reading area for residents.',
    location: 'Ambika Green Clubhouse, 1st Floor',
    workingHours: '8:00 AM - 10:00 PM',
    status: 'Open',
    facilities: ['Wi-Fi', 'Daily Newspapers', 'Book Exchange']
  },

  // 13. Public Toilets
  {
    name: 'Clubhouse Washrooms',
    category: 'Public Toilets',
    description: 'Common washrooms for visitors and staff.',
    location: 'Ambika Green Clubhouse',
    workingHours: '24x7',
    status: 'Available'
  },

  // 14. Parking
  {
    name: 'Resident Basement Parking',
    category: 'Parking',
    description: 'Dedicated parking spots for flat owners.',
    location: 'Ambika Green Basement 1 & 2',
    workingHours: '24x7',
    status: 'Available',
    requirements: ['RFID Car Sticker']
  },
  {
    name: 'Visitor Surface Parking',
    category: 'Parking',
    description: 'Designated parking for guests.',
    location: 'Ambika Green Surface Level',
    workingHours: '24x7',
    status: 'Available',
    requirements: ['Visitor Pass from Gate']
  },

  // 15. Community Centers
  {
    name: 'Ambika Green Clubhouse',
    category: 'Community Centers',
    description: 'Main recreation center for the society.',
    location: 'Ambika Green Phase 1',
    workingHours: '6:00 AM - 11:00 PM',
    status: 'Available',
    facilities: ['Gym', 'Swimming Pool', 'Indoor Games', 'Party Hall'],
    requirements: ['Resident ID Card']
  }
];

const emergenciesData = [
  {
    title: 'Main Gate Security (Ambika Green)',
    contactNumber: '+91-9876543210 (Ext: 100)',
    category: 'Police',
    location: 'Phase 1 Main Gate',
    instructions: 'Call immediately for unauthorized entry, suspicious activity, or night-time escorts.',
    isActive: true
  },
  {
    title: 'Sohana Police Station (Mohali)',
    contactNumber: '112 / 100',
    category: 'Police',
    location: 'Sector 79, Mohali',
    instructions: 'For major law and order issues.',
    isActive: true
  },
  {
    title: 'Fortis Hospital Ambulance',
    contactNumber: '105010',
    category: 'Ambulance',
    location: 'Sector 62, Mohali',
    instructions: 'For severe medical emergencies requiring immediate hospitalization.',
    isActive: true
  },
  {
    title: 'Society Electrician (On Duty)',
    contactNumber: 'Ext: 205',
    category: 'Electricity Emergency',
    location: 'Utility Block',
    instructions: 'For short circuits or complete power failure in the apartment.',
    isActive: true
  },
  {
    title: 'Society Plumber (On Duty)',
    contactNumber: 'Ext: 206',
    category: 'Water Emergency',
    location: 'Utility Block',
    instructions: 'For major leaks or pipe bursts inside the apartment.',
    isActive: true
  },
  {
    title: 'Mohali Fire Brigade',
    contactNumber: '101',
    category: 'Fire Brigade',
    location: 'Phase 1 Industrial Area',
    instructions: 'Call immediately in case of uncontrollable fire.',
    isActive: true
  },
  {
    title: 'Estate Manager (Ambika Green)',
    contactNumber: '+91-9988776655',
    category: 'Disaster Management',
    location: 'Clubhouse Office',
    instructions: 'For lift entrapment, structural issues, or general severe complaints.',
    isActive: true
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear and Seed Services
    await Service.deleteMany({});
    console.log('🗑️ Cleared existing national services.');
    await Service.insertMany(servicesData);
    console.log(`🎉 Successfully seeded ${servicesData.length} Ambika Green local services!`);

    // Clear and Seed Emergencies
    await EmergencyContact.deleteMany({});
    console.log('🗑️ Cleared existing emergencies.');
    await EmergencyContact.insertMany(emergenciesData);
    console.log(`🎉 Successfully seeded ${emergenciesData.length} Ambika Green emergencies!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedDB();
