const CivicPoll = require('../models/CivicPoll');

const seedDefaultPolls = async () => {
  const count = await CivicPoll.countDocuments();
  if (count === 0) {
    const defaultPolls = [
      {
        pollId: 'POL-101',
        title: 'Municipal Solar Roof Energy Grid Allocation',
        description: 'Vote on which public sector buildings should be prioritized for zero-emission solar power plant installation in 2026-2027 budget.',
        category: 'Renewable Energy',
        allocatedBudget: '₹ 75 Lakhs',
        ward: 'City-wide',
        options: [
          { optionId: 'OPT-1', text: 'Municipal Schools & Public Libraries', votesCount: 142 },
          { optionId: 'OPT-2', text: 'Primary Healthcare Centers & Hospitals', votesCount: 289 },
          { optionId: 'OPT-3', text: 'Public Bus Terminals & Metro Depots', votesCount: 96 }
        ],
        status: 'Active',
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        pollId: 'POL-102',
        title: 'Smart Green Belt & Biodiversity Park Upgrade',
        description: 'Choose the primary focus area for the upcoming ₹40 Lakh urban forest and smart recreational park redevelopment initiative.',
        category: 'Parks & Greenery',
        allocatedBudget: '₹ 40 Lakhs',
        ward: 'Kothrud / Baner Sector',
        options: [
          { optionId: 'OPT-A', text: 'Sensor-monitored Jogging Track & Open Gym', votesCount: 210 },
          { optionId: 'OPT-B', text: 'Native Tree Arboretum & Bird Sanctuary Zone', votesCount: 315 },
          { optionId: 'OPT-C', text: 'Children Science Playground & Solar Fountains', votesCount: 178 }
        ],
        status: 'Active',
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      },
      {
        pollId: 'POL-103',
        title: 'EV Charging Infrastructure Expansion Plan',
        description: 'Select the high-density locations for installing 25 fast-charging public EV stations across municipal parking lots.',
        category: 'Transit & Mobility',
        allocatedBudget: '₹ 60 Lakhs',
        ward: 'Shivaji Nagar & Viman Nagar',
        options: [
          { optionId: 'OPT-X', text: 'Railway Station & Swargate Bus Station Hubs', votesCount: 420 },
          { optionId: 'OPT-Y', text: 'IT Parks & Commercial Complex Zone', votesCount: 380 },
          { optionId: 'OPT-Z', text: 'Residential Association Hubs & Shopping Malls', votesCount: 195 }
        ],
        status: 'Active',
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      }
    ];
    await CivicPoll.insertMany(defaultPolls);
    console.log('✅ Default Civic Budgeting Polls Seeded successfully');
  }
};

exports.getAllPolls = async (req, res) => {
  try {
    await seedDefaultPolls();
    const polls = await CivicPoll.find().sort({ createdAt: -1 });
    res.json({ success: true, count: polls.length, polls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.votePoll = async (req, res) => {
  try {
    const { pollId, optionId, userId } = req.body;
    if (!pollId || !optionId || !userId) {
      return res.status(400).json({ success: false, message: 'pollId, optionId, and userId are required' });
    }

    const poll = await CivicPoll.findOne({ pollId });
    if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });

    // Check if user has already voted
    const existingVote = poll.votedUsers.find(v => v.userId === userId.toString());
    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You have already voted in this poll' });
    }

    // Find option and increment vote
    const opt = poll.options.find(o => o.optionId === optionId);
    if (!opt) return res.status(400).json({ success: false, message: 'Invalid option selected' });

    opt.votesCount += 1;
    poll.votedUsers.push({ userId: userId.toString(), optionId });
    await poll.save();

    res.json({ success: true, message: 'Vote recorded successfully!', poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPoll = async (req, res) => {
  try {
    const { title, description, category, allocatedBudget, ward, options } = req.body;
    if (!title || !description || !options || options.length < 2) {
      return res.status(400).json({ success: false, message: 'Title, description, and at least 2 options required' });
    }

    const pollId = 'POL-' + Math.floor(100 + Math.random() * 900);
    const formattedOptions = options.map((optText, idx) => ({
      optionId: `OPT-${idx + 1}`,
      text: optText,
      votesCount: 0
    }));

    const newPoll = new CivicPoll({
      pollId,
      title,
      description,
      category,
      allocatedBudget: allocatedBudget || '₹ 50 Lakhs',
      ward: ward || 'City-wide',
      options: formattedOptions,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await newPoll.save();
    res.status(201).json({ success: true, poll: newPoll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
