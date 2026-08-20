const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./models/Service');

const servicesData = [
  // ============================================
  // 1. WATER SUPPLY
  // ============================================
  {
    name: 'National Jal Jeevan Mission',
    category: 'Water Supply',
    description: 'Central government initiative for rural and urban water supply.',
    detailedDescription: 'The Jal Jeevan Mission ensures safe and adequate drinking water through individual household tap connections by 2024 to all households in rural India. It also manages urban water conservation projects.',
    location: 'New Delhi',
    address: 'Ministry of Jal Shakti, Shram Shakti Bhawan, Rafi Marg, New Delhi 110001',
    area: 'Central Delhi',
    contactNumber: '1800-11-2244',
    email: 'contact@jaljeevanmission.gov.in',
    website: 'https://jaljeevanmission.gov.in',
    workingHours: 'Mon-Fri: 9:00 AM - 5:30 PM',
    status: 'Available',
    facilities: ['Water Quality Testing', 'Har Ghar Jal Portal', 'Citizen Desk'],
    servicesOffered: ['Tap Connection Registration', 'Quality Reports', 'Complaint Redressal'],
    complaintType: 'Utilities'
  },
  {
    name: 'Central Water Commission (CWC)',
    category: 'Water Supply',
    description: 'Premier technical organization in water resources.',
    detailedDescription: 'CWC manages schemes for control, conservation, and utilization of water resources throughout the country, for purpose of flood control, irrigation, navigation, and drinking water supply.',
    location: 'New Delhi',
    address: 'Sewa Bhawan, R.K. Puram, New Delhi 110066',
    area: 'R.K. Puram',
    contactNumber: '011-2610-8855',
    website: 'http://cwc.gov.in',
    workingHours: 'Mon-Fri: 9:00 AM - 5:00 PM',
    status: 'Available',
    facilities: ['Hydrological Data Center', 'Flood Forecasting'],
    servicesOffered: ['Basin Planning', 'Dam Safety', 'Project Appraisal']
  },
  {
    name: 'National Water Development Agency (NWDA)',
    category: 'Water Supply',
    description: 'Inter-basin water transfer and river linking authority.',
    detailedDescription: 'NWDA studies the peninsular and Himalayan river systems to evaluate the feasibility of inter-basin water transfers and river linking to solve national water scarcity.',
    location: 'New Delhi',
    address: '18-20, Community Centre, Saket, New Delhi 110017',
    area: 'Saket',
    contactNumber: '011-2651-9164',
    website: 'http://nwda.gov.in',
    workingHours: 'Mon-Fri: 9:30 AM - 6:00 PM',
    status: 'Available',
    facilities: ['Technical Library', 'Research Wing'],
    servicesOffered: ['Water Resource Surveys', 'River Linking Projects']
  },

  // ============================================
  // 2. ELECTRICITY
  // ============================================
  {
    name: 'National Thermal Power Corporation (NTPC)',
    category: 'Electricity',
    description: 'India\'s largest power utility enterprise.',
    detailedDescription: 'NTPC operates major power generation facilities across India and collaborates with state boards for uninterrupted power distribution and grid management.',
    location: 'New Delhi',
    address: 'NTPC Bhawan, SCOPE Complex, Institutional Area, Lodhi Road, New Delhi 110003',
    area: 'Lodhi Road',
    contactNumber: '011-2436-0100',
    email: 'info@ntpc.co.in',
    website: 'https://www.ntpc.co.in',
    workingHours: 'Mon-Sat: 9:30 AM - 6:00 PM',
    status: 'Available',
    facilities: ['Grid Monitoring', 'R&D Center', 'Public Relations Office'],
    servicesOffered: ['Power Generation Info', 'Corporate Social Responsibility'],
    complaintType: 'Utilities'
  },
  {
    name: 'Power Grid Corporation of India (POWERGRID)',
    category: 'Electricity',
    description: 'Central transmission utility of India.',
    detailedDescription: 'POWERGRID transmits about 50% of the total power generated in India on its transmission network. Operates the national grid.',
    location: 'Gurugram',
    address: 'Saudamini, Plot No.2, Sector 29, Near IFFCO Chowk, Gurugram, Haryana 122001',
    area: 'Sector 29',
    contactNumber: '0124-257-1700',
    emergencyPhone: '1912',
    website: 'https://www.powergrid.in',
    workingHours: '24x7 (Control Room)',
    status: 'Available',
    facilities: ['National Load Despatch Centre', 'Smart Grid Monitoring'],
    servicesOffered: ['Inter-state Power Transmission', 'Telecom Services (Powertel)'],
    complaintType: 'Utilities'
  },

  // ============================================
  // 3. WASTE MANAGEMENT
  // ============================================
  {
    name: 'Swachh Bharat Mission Directorate',
    category: 'Waste Management',
    description: 'National campaign for solid waste management and sanitation.',
    detailedDescription: 'Oversees the implementation of solid waste management protocols, open-defecation free (ODF) initiatives, and large-scale recycling programs across all Indian states and UTs.',
    location: 'New Delhi',
    address: 'Ministry of Housing and Urban Affairs, Nirman Bhawan, New Delhi 110011',
    area: 'Central Delhi',
    contactNumber: '1800-11-1969',
    email: 'swachhbharat@gov.in',
    website: 'https://swachhbharatmission.gov.in',
    workingHours: 'Mon-Fri: 9:00 AM - 6:00 PM',
    status: 'Available',
    facilities: ['National Dashboard', 'Policy Guidelines'],
    servicesOffered: ['City Sanitation Rating Info', 'Funding Guidelines'],
    complaintType: 'Sanitation'
  },
  {
    name: 'Central Pollution Control Board (CPCB)',
    category: 'Waste Management',
    description: 'Statutory organisation for environmental protection and waste regulation.',
    detailedDescription: 'Regulates air/water pollution and governs the strict rules for e-waste, biomedical waste, plastic waste, and hazardous waste management across industries and municipalities.',
    location: 'New Delhi',
    address: 'Parivesh Bhawan, CBD-cum-Office Complex, East Arjun Nagar, Delhi 110032',
    area: 'East Arjun Nagar',
    contactNumber: '011-4310-2030',
    website: 'https://cpcb.nic.in',
    workingHours: 'Mon-Fri: 9:30 AM - 5:30 PM',
    status: 'Available',
    facilities: ['Air/Water Quality Labs', 'E-Waste Monitoring Cell'],
    servicesOffered: ['E-Waste Authorization', 'Pollution Guidelines', 'Public Complaints'],
    complaintType: 'Sanitation'
  },

  // ============================================
  // 4. PUBLIC TRANSPORT
  // ============================================
  {
    name: 'Indian Railways (IRCTC)',
    category: 'Public Transport',
    description: 'National railway network and ticketing portal.',
    detailedDescription: 'Manages the vast railway network connecting all states in India. IRCTC handles online ticketing, catering, and tourism packages.',
    location: 'New Delhi',
    address: 'IRCTC Corporate Office, Barakhamba Road, New Delhi 110001',
    area: 'Connaught Place',
    contactNumber: '139',
    website: 'https://www.irctc.co.in',
    workingHours: '24x7 Support',
    status: 'Available',
    facilities: ['Online Ticketing', 'Tatkal Booking', 'Tourism Packages', 'Retiring Rooms'],
    servicesOffered: ['Train Booking', 'PNR Status', 'Meal Booking', 'Tour Packages'],
    complaintType: 'Public Transport'
  },
  {
    name: 'Delhi Metro Rail Corporation (DMRC)',
    category: 'Public Transport',
    description: 'Largest rapid transit system in India.',
    detailedDescription: 'DMRC operates the massive metro network across Delhi and the National Capital Region (NCR), providing fast, safe, and eco-friendly commuting options.',
    location: 'New Delhi',
    address: 'Metro Bhawan, Fire Brigade Lane, Barakhamba Road, New Delhi 110001',
    contactNumber: '155370',
    website: 'https://www.delhimetrorail.com',
    workingHours: 'Mon-Sun: 5:00 AM - 11:30 PM',
    status: 'Available',
    facilities: ['Smart Card Recharge', 'Women Only Coaches', 'Wheelchair Assistance'],
    servicesOffered: ['Metro Commute', 'Airport Express', 'Bicycle Sharing at Stations'],
    complaintType: 'Public Transport'
  },
  {
    name: 'Air India (National Carrier)',
    category: 'Public Transport',
    description: 'Flag carrier airline of India for domestic and international flights.',
    location: 'New Delhi',
    address: 'Airlines House, 113 Gurudwara Rakabganj Road, New Delhi 110001',
    contactNumber: '011-2462-2220',
    website: 'https://www.airindia.in',
    workingHours: '24x7 Customer Support',
    status: 'Available',
    facilities: ['Online Check-in', 'Lounge Access', 'Special Assistance'],
    servicesOffered: ['Flight Booking', 'Cargo Services', 'Baggage Tracking'],
    complaintType: 'Public Transport'
  },

  // ============================================
  // 5. HOSPITALS
  // ============================================
  {
    name: 'All India Institute of Medical Sciences (AIIMS)',
    category: 'Hospitals',
    description: 'Premier national medical college and hospital.',
    detailedDescription: 'AIIMS New Delhi is India\'s top public hospital and medical research university, offering highly specialized treatments, advanced surgeries, and trauma care.',
    location: 'New Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029',
    contactNumber: '011-2658-8500',
    emergencyPhone: '102',
    website: 'https://www.aiims.edu',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['Trauma Center', 'Cancer Center', 'Cardiothoracic Center', 'Research Labs'],
    servicesOffered: ['Specialized OPD', 'In-patient Care', 'Surgeries', 'Telemedicine'],
    complaintType: 'Healthcare'
  },
  {
    name: 'Safdarjung Hospital',
    category: 'Hospitals',
    description: 'Large multi-specialty central government hospital.',
    detailedDescription: 'One of the largest government hospitals in India, renowned for its Burns and Plastic Surgery department and huge maternity ward.',
    location: 'New Delhi',
    address: 'Ring Road, Opposite AIIMS, New Delhi 110029',
    contactNumber: '011-2616-5060',
    emergencyPhone: '102',
    website: 'http://vmmc-sjh.nic.in',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['Burns Ward', 'Maternity Ward', 'Blood Bank', 'ICU'],
    servicesOffered: ['OPD', 'Emergency Care', 'Free Medicines (Govt Schemes)'],
    complaintType: 'Healthcare'
  },
  {
    name: 'National Institute of Mental Health (NIMHANS)',
    category: 'Hospitals',
    description: 'Apex center for mental health and neuroscience.',
    detailedDescription: 'NIMHANS is an institute of national importance providing top-tier clinical care, research, and training in psychiatry, neurology, and neurosurgery.',
    location: 'Bengaluru',
    address: 'Hosur Road, Lakkasandra, Bengaluru, Karnataka 560029',
    contactNumber: '080-2699-5000',
    emergencyPhone: '14416 (Tele-MANAS)',
    website: 'https://nimhans.ac.in',
    workingHours: '24x7 (Emergency)',
    status: 'Available',
    facilities: ['Neurology Ward', 'Psychiatry Center', 'Rehabilitation Center'],
    servicesOffered: ['Counseling', 'Brain Scans', 'Neuro-Surgeries', 'De-addiction'],
    complaintType: 'Healthcare'
  },

  // ============================================
  // 6. SCHOOLS/COLLEGES
  // ============================================
  {
    name: 'Indian Institute of Technology (IIT) Delhi',
    category: 'Schools/Colleges',
    description: 'Premier national engineering and technology institute.',
    location: 'New Delhi',
    address: 'IIT Campus, Hauz Khas, New Delhi 110016',
    contactNumber: '011-2659-7135',
    website: 'https://home.iitd.ac.in',
    workingHours: 'Mon-Fri: 9:00 AM - 5:30 PM',
    status: 'Open',
    facilities: ['Central Library', 'Research Labs', 'Hostels', 'Sports Complex'],
    servicesOffered: ['B.Tech', 'M.Tech', 'Ph.D', 'Executive MBA']
  },
  {
    name: 'Indian Institute of Management (IIM) Ahmedabad',
    category: 'Schools/Colleges',
    description: 'India\'s top-ranked business school.',
    detailedDescription: 'IIMA is a public business school in Gujarat, known for its rigorous academic programs, executive education, and strong global alumni network.',
    location: 'Ahmedabad',
    address: 'Vastrapur, Ahmedabad, Gujarat 380015',
    contactNumber: '079-2630-8357',
    website: 'https://www.iima.ac.in',
    workingHours: 'Mon-Fri: 9:00 AM - 6:00 PM',
    status: 'Open',
    facilities: ['Vikram Sarabhai Library', 'Syndicate Rooms', 'Executive Hostels'],
    servicesOffered: ['MBA', 'Executive MBA', 'Ph.D in Management', 'Corporate Training']
  },
  {
    name: 'Jawaharlal Nehru University (JNU)',
    category: 'Schools/Colleges',
    description: 'Leading university for arts, sciences, and humanities.',
    detailedDescription: 'JNU is a premier central university renowned for its liberal arts programs, foreign language schools, and politically active student community.',
    location: 'New Delhi',
    address: 'New Mehrauli Road, JNU Ring Rd, New Delhi 110067',
    contactNumber: '011-2674-2575',
    website: 'https://www.jnu.ac.in',
    workingHours: 'Mon-Fri: 9:30 AM - 5:30 PM',
    status: 'Open',
    facilities: ['Dr. B.R. Ambedkar Central Library', 'Language Labs', 'Convention Center'],
    servicesOffered: ['B.A.', 'M.A.', 'M.Phil', 'Ph.D']
  },

  // ============================================
  // 7. GOVERNMENT OFFICES
  // ============================================
  {
    name: 'Unique Identification Authority of India (UIDAI)',
    category: 'Government Offices',
    description: 'National authority for Aadhar Card issuance and management.',
    location: 'New Delhi',
    address: 'UIDAI Headquarters, Bangla Sahib Road, Gole Market, New Delhi 110001',
    contactNumber: '1947',
    website: 'https://uidai.gov.in',
    workingHours: 'Mon-Sat: 9:30 AM - 6:00 PM',
    status: 'Open',
    facilities: ['Aadhar Enrollment', 'Update Centers', 'Grievance Cell'],
    servicesOffered: ['New Aadhar Enrollment', 'Biometric Update', 'Address Update']
  },
  {
    name: 'Election Commission of India',
    category: 'Government Offices',
    description: 'Autonomous constitutional authority managing elections.',
    detailedDescription: 'The ECI administers elections to the Lok Sabha, Rajya Sabha, State Legislative Assemblies, and the offices of the President and Vice President in India.',
    location: 'New Delhi',
    address: 'Nirvachan Sadan, Ashoka Road, New Delhi 110001',
    contactNumber: '1950',
    website: 'https://eci.gov.in',
    workingHours: 'Mon-Fri: 10:00 AM - 5:00 PM',
    status: 'Open',
    facilities: ['Voter Registration Helpdesk', 'EVM Demonstration Center'],
    servicesOffered: ['Voter ID Issuance', 'Electoral Roll Correction', 'Political Party Registration']
  },
  {
    name: 'Passport Seva Kendra (Regional HQ)',
    category: 'Government Offices',
    description: 'Ministry of External Affairs passport issuance center.',
    detailedDescription: 'Handles applications for new passports, renewals, and police clearance certificates via a streamlined digital process and physical biometric verification.',
    location: 'Pan-India',
    address: 'Central Passport Organization, Patiala House Annexe, Tilak Marg, New Delhi 110001',
    contactNumber: '1800-258-1800',
    website: 'https://www.passportindia.gov.in',
    workingHours: 'Mon-Fri: 9:00 AM - 4:30 PM (By Appointment Only)',
    status: 'Open',
    facilities: ['Biometric Capture', 'Document Verification Counters'],
    servicesOffered: ['Tatkaal Passport', 'Standard Passport', 'Police Clearance Certificate (PCC)'],
    requirements: ['Aadhar Card', 'Address Proof', 'DOB Proof', 'Online Appointment']
  },

  // ============================================
  // 8. BANKS/ATMs
  // ============================================
  {
    name: 'Reserve Bank of India (RBI)',
    category: 'Banks/ATMs',
    description: 'India\'s central bank and regulatory body.',
    location: 'Mumbai',
    address: 'RBI Central Office, Shahid Bhagat Singh Marg, Fort, Mumbai 400001',
    contactNumber: '14440',
    website: 'https://rbi.org.in',
    workingHours: 'Mon-Fri: 10:00 AM - 5:00 PM',
    status: 'Available',
    facilities: ['Banking Ombudsman', 'Financial Inclusion Cell', 'Public Debt Office'],
    servicesOffered: ['Grievance Redressal against Banks', 'Sovereign Gold Bonds Info']
  },
  {
    name: 'State Bank of India (Corporate Centre)',
    category: 'Banks/ATMs',
    description: 'Largest public sector bank in India.',
    detailedDescription: 'SBI provides a wide range of retail banking, corporate banking, and international banking services with the largest network of branches and ATMs across the nation.',
    location: 'Mumbai',
    address: 'State Bank Bhavan, Madame Cama Road, Nariman Point, Mumbai, Maharashtra 400021',
    contactNumber: '1800-11-2211',
    website: 'https://www.sbi.co.in',
    workingHours: 'Mon-Fri: 10:00 AM - 4:00 PM',
    status: 'Available',
    facilities: ['24x7 ATM', 'Cash Deposit Machine', 'Forex Desk'],
    servicesOffered: ['Retail Banking', 'Corporate Loans', 'YONO Digital Services']
  },
  {
    name: 'National Payments Corporation of India (NPCI)',
    category: 'Banks/ATMs',
    description: 'Umbrella organisation for operating retail payments.',
    detailedDescription: 'Creators of UPI, RuPay, IMPS, and Fastag. NPCI manages the digital payment infrastructure ensuring secure, fast, and robust nationwide transactions.',
    location: 'Mumbai',
    address: 'The Capital, B Wing, 9th Floor, Bandra-Kurla Complex, Bandra (E), Mumbai 400051',
    contactNumber: '1800-120-1740',
    website: 'https://www.npci.org.in',
    workingHours: '24x7 Technical Support',
    status: 'Available',
    facilities: ['UPI Switch', 'RuPay Network Operations', 'Fraud Monitoring'],
    servicesOffered: ['UPI Integration', 'Bharat BillPay', 'AEPS Services']
  },

  // ============================================
  // 9. POLICE STATIONS
  // ============================================
  {
    name: 'Central Bureau of Investigation (CBI) HQ',
    category: 'Police Stations',
    description: 'Premier national investigating agency of India.',
    location: 'New Delhi',
    address: 'CBI Headquarters, CGO Complex, Lodhi Road, New Delhi 110003',
    contactNumber: '011-2436-0213',
    emergencyPhone: '112',
    website: 'https://cbi.gov.in',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['Anti-Corruption Branch', 'Economic Offenses Wing', 'Special Crimes Branch'],
    servicesOffered: ['High-level Investigations', 'Interpol Coordination'],
    complaintType: 'Public Safety'
  },
  {
    name: 'National Investigation Agency (NIA)',
    category: 'Police Stations',
    description: 'Central counter-terrorism law enforcement agency.',
    detailedDescription: 'NIA is empowered to deal with terror-related crimes across states without special permission from the states, ensuring national security.',
    location: 'New Delhi',
    address: 'NIA HQ, Opposite CGO Complex, Lodhi Road, New Delhi 110003',
    contactNumber: '011-2436-8800',
    website: 'https://www.nia.gov.in',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['Counter-Terrorism Cell', 'Cyber Forensics Lab', 'Intelligence Wing'],
    servicesOffered: ['Anti-Terror Investigations', 'Threat Intelligence', 'Wanted Persons Info'],
    complaintType: 'Public Safety'
  },
  {
    name: 'Cyber Crime Reporting Portal (MHA)',
    category: 'Police Stations',
    description: 'National portal to report cybercrimes.',
    detailedDescription: 'Operated by the Ministry of Home Affairs to facilitate victims/complainants to report cybercrime complaints online, specifically focusing on crimes against women and children.',
    location: 'Pan-India',
    address: 'Virtual Portal (Ministry of Home Affairs, New Delhi)',
    emergencyPhone: '1930',
    website: 'https://cybercrime.gov.in',
    workingHours: '24x7 Helpdesk',
    status: 'Available',
    facilities: ['Online FIR Registration', 'Financial Fraud Takedown', 'Anonymous Reporting'],
    servicesOffered: ['Report Cyber Bullying', 'Financial Fraud Reporting', 'Ransomware Help'],
    complaintType: 'Public Safety'
  },

  // ============================================
  // 10. FIRE STATIONS
  // ============================================
  {
    name: 'National Disaster Response Force (NDRF)',
    category: 'Fire Stations',
    description: 'Specialized force for national disasters and major rescues.',
    location: 'New Delhi',
    address: 'NDRF HQ, NDCC-II Building, Jai Singh Road, New Delhi 110001',
    contactNumber: '011-2343-8017',
    emergencyPhone: '1078',
    website: 'https://www.ndrf.gov.in',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['Rescue Battalions', 'Hazmat Teams', 'Urban Search & Rescue'],
    servicesOffered: ['Disaster Rescue', 'Emergency Evacuation'],
    complaintType: 'Public Safety'
  },
  {
    name: 'Delhi Fire Services Headquarters',
    category: 'Fire Stations',
    description: 'Apex fire service for the National Capital.',
    detailedDescription: 'Equipped with the largest fleet of fire tenders, hydraulic platforms, and specialized drone units to tackle massive fires in congested areas and high-rises in Delhi.',
    location: 'New Delhi',
    address: 'DFS HQ, Connaught Lane, Barakhamba Road, New Delhi 110001',
    contactNumber: '011-2341-2222',
    emergencyPhone: '101',
    website: 'http://dfs.delhigovt.nic.in',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['Hydraulic Platforms', 'Fire Boats', 'Water Tenders'],
    servicesOffered: ['Fire Combat', 'Building Fire Safety NOC', 'Rescue Operations'],
    complaintType: 'Public Safety'
  },
  {
    name: 'Mumbai Fire Brigade Headquarters',
    category: 'Fire Stations',
    description: 'One of the oldest and largest fire departments in India.',
    detailedDescription: 'Protects the city of Mumbai, specialized in tackling high-rise fires, chemical fires at ports, and executing rescue operations during the monsoon floods.',
    location: 'Mumbai',
    address: 'Byculla Command Center, Byculla, Mumbai, Maharashtra 400008',
    contactNumber: '022-2307-6111',
    emergencyPhone: '101',
    website: 'https://portal.mcgm.gov.in',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['Command & Control Center', 'Beach Rescue Teams', 'Hazmat Units'],
    servicesOffered: ['Fire Extinguishing', 'Monsoon Rescue', 'Fire Audits'],
    complaintType: 'Public Safety'
  },

  // ============================================
  // 11. PARKS
  // ============================================
  {
    name: 'Jim Corbett National Park',
    category: 'Parks',
    description: 'India\'s oldest national park and major tiger reserve.',
    location: 'Uttarakhand',
    address: 'Nainital District, Ramnagar, Uttarakhand 244715',
    contactNumber: '05942-231-893',
    website: 'https://www.corbettonline.uk.gov.in',
    workingHours: 'Mon-Sun: 6:00 AM - 10:00 AM, 2:00 PM - 6:00 PM',
    status: 'Open',
    facilities: ['Safari Tours', 'Forest Rest Houses', 'Interpretation Center'],
    servicesOffered: ['Jeep Safari', 'Canter Safari', 'Eco-Tourism Stays']
  },
  {
    name: 'Kaziranga National Park',
    category: 'Parks',
    description: 'World Heritage Site known for One-Horned Rhinoceros.',
    detailedDescription: 'Located in Assam, this park hosts two-thirds of the world\'s great one-horned rhinoceroses. It boasts high species diversity and vast expanses of tall elephant grass.',
    location: 'Assam',
    address: 'Kanchanjuri, Kaziranga, Assam 782136',
    contactNumber: '03776-262-428',
    website: 'https://kaziranga.assam.gov.in',
    workingHours: 'Mon-Sun: 7:30 AM - 11:00 AM, 2:00 PM - 4:30 PM',
    status: 'Open',
    facilities: ['Elephant Safari', 'Watch Towers', 'Brahmaputra River Cruises'],
    servicesOffered: ['Wildlife Viewing', 'Photography Tours', 'Nature Walks']
  },
  {
    name: 'Sundarbans National Park',
    category: 'Parks',
    description: 'Largest mangrove forest and home to the Royal Bengal Tiger.',
    detailedDescription: 'A UNESCO World Heritage Site in West Bengal, encompassing a vast network of tidal waterways, mudflats, and small islands of salt-tolerant mangrove forests.',
    location: 'West Bengal',
    address: 'Dayapur, Gosaba, West Bengal 743370',
    contactNumber: '03218-214-960',
    website: 'https://sunderbannationalpark.in',
    workingHours: 'Mon-Sun: 8:00 AM - 6:00 PM',
    status: 'Open',
    facilities: ['Boat Safaris', 'Watch Towers', 'Eco-Villages'],
    servicesOffered: ['Guided Boat Tours', 'Bird Watching', 'Village Tourism']
  },

  // ============================================
  // 12. LIBRARIES
  // ============================================
  {
    name: 'National Library of India',
    category: 'Libraries',
    description: 'Largest library in India by volume and public record.',
    location: 'Kolkata',
    address: 'Belvedere Road, Alipore, Kolkata, West Bengal 700027',
    contactNumber: '033-2479-1381',
    website: 'https://www.nationallibrary.gov.in',
    workingHours: 'Mon-Fri: 9:00 AM - 8:00 PM, Sat-Sun: 9:30 AM - 6:00 PM',
    status: 'Open',
    facilities: ['Reading Rooms', 'Digitized Archives', 'Rare Book Collection'],
    servicesOffered: ['Reference Services', 'Membership', 'Reprography']
  },
  {
    name: 'Delhi Public Library',
    category: 'Libraries',
    description: 'Premier public library system in Delhi.',
    detailedDescription: 'Funded by the Ministry of Culture, it offers a vast collection of books across regional languages, mobile library buses, and special sections for children and visually impaired persons.',
    location: 'New Delhi',
    address: 'S.P. Mukherjee Marg, Opposite Old Delhi Railway Station, Delhi 110006',
    contactNumber: '011-2396-2682',
    website: 'http://dpl.gov.in',
    workingHours: 'Mon-Sat: 10:00 AM - 7:00 PM',
    status: 'Open',
    facilities: ['Braille Library', 'Children Section', 'Mobile Library Vans'],
    servicesOffered: ['Book Borrowing', 'Reading Room', 'Cultural Programs']
  },
  {
    name: 'Connemara Public Library',
    category: 'Libraries',
    description: 'One of the four National Depository Libraries.',
    detailedDescription: 'Located in Chennai, it receives a copy of all books, newspapers, and periodicals published in India. Housed in a stunning heritage building.',
    location: 'Chennai',
    address: 'Museum Compound, Pantheon Road, Egmore, Chennai, Tamil Nadu 600008',
    contactNumber: '044-2819-3751',
    website: 'http://connemarapubliclibrarychennai.com',
    workingHours: 'Mon-Sat: 9:00 AM - 7:30 PM, Sun: 9:30 AM - 6:00 PM',
    status: 'Open',
    facilities: ['Depository Section', 'IAS Study Center', 'Heritage Reading Hall'],
    servicesOffered: ['Reference Section', 'Book Lending', 'Academic Study Area']
  },

  // ============================================
  // 13. PUBLIC TOILETS
  // ============================================
  {
    name: 'Sulabh International Headquarters',
    category: 'Public Toilets',
    description: 'Pioneer of the public toilet movement across India.',
    location: 'New Delhi',
    address: 'Sulabh Bhawan, Mahavir Enclave, Palam Dabri Marg, New Delhi 110045',
    contactNumber: '011-2503-1518',
    website: 'https://www.sulabhinternational.org',
    workingHours: '24x7 (Toilet Complexes)',
    status: 'Available',
    facilities: ['Pay and Use Toilets', 'Bathing Facilities', 'Biogas Plants'],
    servicesOffered: ['Public Sanitation', 'Sanitation Education'],
    complaintType: 'Sanitation'
  },
  {
    name: 'Swachh Bharat Public e-Toilets',
    category: 'Public Toilets',
    description: 'Automated, self-cleaning electronic toilets.',
    detailedDescription: 'Installed in major tier-1 and tier-2 cities, these unmanned, coin-operated e-toilets wash the floors and flush automatically after every use.',
    location: 'Pan-India',
    address: 'Various locations in major Indian cities',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['Automated Flush', 'Self-Washing Floor', 'Coin Operator', 'Women Napkin Dispensers'],
    servicesOffered: ['Hygienic Sanitation', 'Accessibility Ramps'],
    fees: '₹5 Coin Operated',
    complaintType: 'Sanitation'
  },

  // ============================================
  // 14. PARKING
  // ============================================
  {
    name: 'National Highways Authority (NHAI) FASTag',
    category: 'Parking',
    description: 'National electronic toll collection and highway parking initiative.',
    location: 'New Delhi',
    address: 'NHAI HQ, Sector-10, Dwarka, New Delhi 110075',
    contactNumber: '1033',
    website: 'https://ihmcl.co.in/fastag',
    workingHours: '24x7 Helpline',
    status: 'Available',
    facilities: ['Cashless Tolls', 'Cashless Parking Integration', 'Online Recharge'],
    servicesOffered: ['FASTag Issuance', 'Toll Issue Resolution', 'Parking Payments'],
    complaintType: 'Infrastructure'
  },
  {
    name: 'Smart City Municipal Parking',
    category: 'Parking',
    description: 'App-based smart municipal parking spaces.',
    detailedDescription: 'Multi-level and on-street smart parking implemented by various Smart City missions (e.g. NDMC, PMC). Users can book spots via a central mobile app, reducing traffic congestion.',
    location: 'Major Smart Cities',
    address: 'Available in Delhi, Pune, Bengaluru, Indore, etc.',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['Sensor Based Slots', 'App Pre-booking', 'EV Charging Stacks', 'CCTV Security'],
    servicesOffered: ['Hourly Parking', 'Monthly Passes', 'Valet (Selected Locations)'],
    fees: 'Dynamic based on city and vehicle type',
    complaintType: 'Infrastructure'
  },
  {
    name: 'Airport Authority Parking (AAI)',
    category: 'Parking',
    description: 'Secured long-term and short-term parking at national airports.',
    detailedDescription: 'Operated across all major AAI airports, offering premium, standard, and FASTag enabled lanes for picking up, dropping off, or parking vehicles for days.',
    location: 'Pan-India Airports',
    address: 'Rajiv Gandhi Bhawan, Safdarjung Airport, New Delhi 110003 (HQ)',
    contactNumber: '011-2463-2950',
    website: 'https://www.aai.aero',
    workingHours: '24x7',
    status: 'Available',
    facilities: ['FASTag Lanes', 'Long-term Park & Fly', 'Golf Cart Shuttles', 'VIP Parking'],
    servicesOffered: ['Terminal Parking', 'Cab Aggregator Staging'],
    fees: 'Varies by airport (Usually ₹100-₹200/hr)',
    complaintType: 'Infrastructure'
  },

  // ============================================
  // 15. COMMUNITY CENTERS
  // ============================================
  {
    name: 'India Habitat Centre (IHC)',
    category: 'Community Centers',
    description: 'Premier national cultural and convention center.',
    location: 'New Delhi',
    address: 'Lodhi Road, Near Air Force Bal Bharati School, New Delhi 110003',
    contactNumber: '011-2468-2002',
    website: 'https://www.indiahabitat.org',
    workingHours: 'Mon-Sun: 8:00 AM - 10:00 PM',
    status: 'Available',
    facilities: ['Auditoriums', 'Art Galleries', 'Restaurants', 'Library'],
    servicesOffered: ['Venue Booking', 'Cultural Programs', 'Exhibitions']
  },
  {
    name: 'Vigyan Bhawan',
    category: 'Community Centers',
    description: 'Premier convention centre of Government of India.',
    detailedDescription: 'Maintained by CPWD, this is the primary venue for national and international conferences, summits, and award ceremonies hosted by the government.',
    location: 'New Delhi',
    address: 'Maulana Azad Road, Rajpath Area, Central Secretariat, New Delhi 110011',
    contactNumber: '011-2302-2231',
    website: 'https://cpwd.gov.in',
    workingHours: 'Mon-Fri: 9:00 AM - 6:00 PM (Events vary)',
    status: 'Open',
    facilities: ['Plenary Hall', 'VIP Lounges', 'Press Briefing Rooms', 'High Security'],
    servicesOffered: ['State Conferences', 'International Summits', 'National Awards Ceremonies'],
    requirements: ['Strict security clearance/invitation required for entry']
  },
  {
    name: 'National Centre for the Performing Arts (NCPA)',
    category: 'Community Centers',
    description: 'India\'s premier cultural institution for music, dance, and theater.',
    detailedDescription: 'Located at Nariman Point, NCPA is a world-class venue hosting symphony orchestras, traditional Indian dance recitals, experimental theater, and film screenings.',
    location: 'Mumbai',
    address: 'NCPA Marg, Nariman Point, Mumbai, Maharashtra 400021',
    contactNumber: '022-6622-3737',
    website: 'https://www.ncpamumbai.com',
    workingHours: 'Mon-Sun: 10:00 AM - 10:00 PM',
    status: 'Open',
    facilities: ['Jamshed Bhabha Theatre', 'Tata Theatre', 'Experimental Theatre', 'Symphony Orchestra'],
    servicesOffered: ['Live Performances', 'Workshops', 'Library of Music'],
    fees: 'Event ticket prices vary'
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    await Service.deleteMany({});
    console.log('🗑️ Cleared existing services.');

    await Service.insertMany(servicesData);
    console.log(`🎉 Successfully seeded ${servicesData.length} comprehensive Smart City services!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
  }
}

seedDB();
