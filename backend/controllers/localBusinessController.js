const LocalBusiness = require('../models/LocalBusiness');

// Default initial seed data for Mohali local businesses and farmers
const defaultLocalListings = [
  {
    title: 'Phase 3B2 Organic Kisan Mandi',
    category: 'Organic Farmers & Kisan Mandi',
    ownerName: 'Gurpreet Singh (Farmer Producer Org)',
    sector: 'Phase 3B2 Market Grounds',
    address: 'SCF 14-18, Phase 3B2 Commercial Market, Mohali',
    contactNumber: '+91 98140 12345',
    description: 'Fresh organic vegetables, farm-fresh sugarcane juice, pure Desi Ghee, and pesticide-free wheat directly brought from local farms around SAS Nagar.',
    productsOffered: ['Organic Vegetables', 'A2 Desi Ghee', 'Farm Fresh Honey', 'Natural Jaggery'],
    rating: 4.9,
    badge: 'Verified Kisan FPO'
  },
  {
    title: 'Punjabi Craft & Phulkari Studio',
    category: 'Handicrafts & Artisans',
    ownerName: 'Harpreet Kaur',
    sector: 'Sector 70',
    address: 'Booth 45, Sector 70 Shopping Complex, Mohali',
    contactNumber: '+91 98722 54321',
    description: 'Authentic handmade Phulkari dupattas, Punjabi juttis, traditional brassware, and handcrafted home decor by women self-help groups in Mohali.',
    productsOffered: ['Handmade Phulkari Dupattas', 'Handcrafted Juttis', 'Traditional Pottery', 'Brassware'],
    rating: 4.8,
    badge: 'Artisan SHG Guild'
  },
  {
    title: 'Mohali Heritage Bakery & Artisanal Sweets',
    category: 'Mohali Food & Bakeries',
    ownerName: 'Amanpreet Sharma',
    sector: 'Phase 7',
    address: 'SCO 22, Phase 7 Main Market, Mohali',
    contactNumber: '+91 98555 67890',
    description: 'Famous fresh bakery items, multigrain sourdough breads, traditional Pinni sweets, and sugar-free seasonal Punjabi delicacies.',
    productsOffered: ['Desi Ghee Pinni', 'Sourdough Bread', 'Sugar-free Sweets', 'Artisanal Cookies'],
    rating: 4.9,
    badge: 'Heritage Food Hub'
  },
  {
    title: 'Aerocity IT Tech Solutions & Hardware Services',
    category: 'IT Startups & Tech Services',
    ownerName: 'Varun Sharma',
    sector: 'Industrial Area Phase 8 / Aerocity',
    address: 'Plot 102, Industrial Area Phase 8, Mohali',
    contactNumber: '+91 98111 22334',
    description: 'Local IT hardware support, laptop diagnostics, home smart Wi-Fi setup, and web development services for small businesses in SAS Nagar.',
    productsOffered: ['Laptop Repairs', 'Smart Home Setup', 'CCTV Installation', 'Website Creation'],
    rating: 4.7,
    badge: 'Local Tech Startup'
  }
];

// Get all local businesses / farmer listings
exports.getBusinesses = async (req, res) => {
  try {
    let listings = await LocalBusiness.find().sort({ createdAt: -1 });
    
    // Seed default Mohali listings if database is empty
    if (listings.length === 0) {
      listings = await LocalBusiness.insertMany(defaultLocalListings);
    }
    
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch local business listings' });
  }
};

// Add a new local vendor / farmer listing
exports.addBusiness = async (req, res) => {
  try {
    const { title, category, ownerName, sector, address, contactNumber, description, productsOffered } = req.body;
    
    if (!title || !category || !ownerName || !sector || !address || !contactNumber || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const business = new LocalBusiness({
      title,
      category,
      ownerName,
      sector,
      address,
      contactNumber,
      description,
      productsOffered: Array.isArray(productsOffered) ? productsOffered : (productsOffered ? productsOffered.split(',').map(s => s.trim()) : [])
    });

    await business.save();
    res.status(201).json(business);
  } catch (err) {
    res.status(500).json({ error: 'Failed to register local business' });
  }
};
