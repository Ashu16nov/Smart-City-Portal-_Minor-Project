const CivicPoll = require('../models/CivicPoll');

const seedDefaultPolls = async () => {
  const count = await CivicPoll.countDocuments();
  if (count === 0) {
    const defaultPolls = [
      {
        pollId: 'POL-101',
        title: 'MC Mohali Solar Roof Energy Grid Initiative',
        description: 'Vote on which municipal government buildings in Mohali should be prioritized for zero-emission solar power installation in 2026-2027 budget.',
        category: 'Renewable Energy',
        allocatedBudget: '₹ 75 Lakhs',
        ward: 'City-wide Mohali',
        options: [
          { optionId: 'OPT-1', text: 'Municipal Corporation Schools & Libraries', votesCount: 248 },
          { optionId: 'OPT-2', text: 'Civil Hospital Phase 6 & Sector Dispensaries', votesCount: 412 },
          { optionId: 'OPT-3', text: 'Phase 8 IT Bus Stand & Transit Depots', votesCount: 165 }
        ],
        status: 'Active',
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        pollId: 'POL-102',
        title: 'Phase 7 & Sector 70 Green Belt & Rose Park Redevelopment',
        description: 'Choose the primary focus area for the upcoming ₹45 Lakh urban forest and smart recreational park redevelopment initiative in SAS Nagar.',
        category: 'Parks & Greenery',
        allocatedBudget: '₹ 45 Lakhs',
        ward: 'Phase 7 / Sector 70 Mohali',
        options: [
          { optionId: 'OPT-A', text: 'Sensor-Monitored Jogging Track & Outdoor Gym', votesCount: 310 },
          { optionId: 'OPT-B', text: 'Native Tree Arboretum & Botanical Fountain Zone', votesCount: 425 },
          { optionId: 'OPT-C', text: 'Children Science Park & Solar Lighting', votesCount: 238 }
        ],
        status: 'Active',
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      },
      {
        pollId: 'POL-103',
        title: 'Mohali EV Fast Charging Network Expansion',
        description: 'Select priority locations for installing 25 fast-charging public EV stations across municipal parking lots and Airport Road corridor.',
        category: 'Transit & Mobility',
        allocatedBudget: '₹ 60 Lakhs',
        ward: 'Phase 3B2 & Aerocity Corridor',
        options: [
          { optionId: 'OPT-X', text: 'Phase 8 IT Park & Bus Terminal Hub', votesCount: 512 },
          { optionId: 'OPT-Y', text: 'Phase 3B2 Market & Sector 70 Parking', votesCount: 468 },
          { optionId: 'OPT-Z', text: 'Aerocity International Airport Road Hub', votesCount: 290 }
        ],
        status: 'Active',
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      }
    ];
    await CivicPoll.insertMany(defaultPolls);
    console.log('✅ Default Mohali Civic Budgeting Polls Seeded successfully');
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

    const existingVote = poll.votedUsers.find(v => v.userId === userId.toString());
    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You have already voted in this poll' });
    }

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
      ward: ward || 'City-wide Mohali',
      options: formattedOptions,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await newPoll.save();
    res.status(201).json({ success: true, poll: newPoll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
