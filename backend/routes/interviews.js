const express = require('express');
const Interview = require('../models/Interview');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all experiences
router.get('/', auth, async (req, res) => {
  try {
    const { company, result, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (company) filter.company = new RegExp(company, 'i');
    if (result) filter.result = result;

    const total = await Interview.countDocuments(filter);
    const experiences = await Interview.find(filter)
      .populate('user', 'name college department year')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const safe = experiences.map(e => {
      const obj = e.toObject();
      if (obj.isAnonymous) { obj.user = { name: 'Anonymous', college: '', department: '', year: '' }; }
      return obj;
    });

    res.json({ experiences: safe, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add experience
router.post('/', auth, async (req, res) => {
  try {
    const interview = new Interview({ ...req.body, user: req.user._id });
    await interview.save();
    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/unlike
router.post('/:id/like', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    const liked = interview.likes.includes(req.user._id);
    if (liked) {
      interview.likes.pull(req.user._id);
    } else {
      interview.likes.push(req.user._id);
    }
    await interview.save();
    res.json({ likes: interview.likes.length, liked: !liked });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my experiences
router.get('/mine', auth, async (req, res) => {
  try {
    const experiences = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
