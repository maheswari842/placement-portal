const express = require('express');
const User = require('../models/User');
const Submission = require('../models/Submission');
const AptitudeTest = require('../models/AptitudeTest');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get full progress dashboard
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Coding activity heatmap (last 30 days)
    const codingActivity = await Submission.aggregate([
      { $match: { user: req.user._id, submittedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    // Aptitude performance trend
    const aptitudeTrend = await AptitudeTest.find({
      user: req.user._id, status: 'completed'
    }).sort({ completedAt: -1 }).limit(10).select('percentage category completedAt');

    // Category-wise solved questions
    const categoryProgress = await Submission.aggregate([
      { $match: { user: req.user._id, status: 'accepted' } },
      { $lookup: { from: 'codingquestions', localField: 'question', foreignField: '_id', as: 'q' } },
      { $unwind: '$q' },
      { $group: { _id: '$q.category', count: { $sum: 1 } } }
    ]);

    // Recent activity
    const recentSubmissions = await Submission.find({ user: req.user._id })
      .populate('question', 'title difficulty category')
      .sort({ submittedAt: -1 })
      .limit(10);

    const recentTests = await AptitudeTest.find({ user: req.user._id, status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalPoints: user.totalPoints,
        streak: user.streak,
        codingStats: user.codingStats,
        aptitudeStats: user.aptitudeStats
      },
      codingActivity,
      aptitudeTrend,
      categoryProgress,
      recentSubmissions,
      recentTests,
      badges: user.badges
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's solved questions
router.get('/solved', auth, async (req, res) => {
  try {
    const solved = await Submission.find({ user: req.user._id, status: 'accepted' })
      .populate('question', 'title difficulty category')
      .sort({ submittedAt: -1 });

    const uniqueSolved = [];
    const seen = new Set();
    solved.forEach(s => {
      if (s.question && !seen.has(s.question._id.toString())) {
        seen.add(s.question._id.toString());
        uniqueSolved.push(s);
      }
    });

    res.json(uniqueSolved);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Award badge manually (admin)
router.post('/badge/:userId', async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    await User.findByIdAndUpdate(req.params.userId, {
      $push: { badges: { name, description, icon, earnedAt: new Date() } }
    });
    res.json({ message: 'Badge awarded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
