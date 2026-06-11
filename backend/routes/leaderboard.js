const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Global leaderboard
router.get('/', auth, async (req, res) => {
  try {
    const { type = 'overall', page = 1, limit = 20 } = req.query;
    let sortField = { totalPoints: -1 };

    if (type === 'coding') sortField = { 'codingStats.totalSolved': -1 };
    if (type === 'aptitude') sortField = { 'aptitudeStats.totalCorrect': -1 };
    if (type === 'streak') sortField = { streak: -1 };

    const total = await User.countDocuments({ role: 'student' });
    const users = await User.find({ role: 'student' })
      .select('name college department year totalPoints codingStats aptitudeStats streak badges')
      .sort(sortField)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Add rank
    const leaderboard = users.map((u, i) => ({
      ...u.toObject(),
      rank: (page - 1) * limit + i + 1
    }));

    // Get current user's rank
    const allUsers = await User.find({ role: 'student' }).sort(sortField).select('_id');
    const myRank = allUsers.findIndex(u => u._id.toString() === req.user._id.toString()) + 1;

    res.json({ leaderboard, total, pages: Math.ceil(total / limit), myRank });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// College leaderboard
router.get('/college', auth, async (req, res) => {
  try {
    const college = req.user.college;
    if (!college) return res.status(400).json({ message: 'No college set on profile' });

    const users = await User.find({ college, role: 'student' })
      .select('name department year totalPoints codingStats aptitudeStats streak')
      .sort({ totalPoints: -1 })
      .limit(50);

    const leaderboard = users.map((u, i) => ({ ...u.toObject(), rank: i + 1 }));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Weekly leaderboard
router.get('/weekly', auth, async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const Submission = require('../models/Submission');
    const AptitudeTest = require('../models/AptitudeTest');

    const codingPoints = await Submission.aggregate([
      { $match: { status: 'accepted', submittedAt: { $gte: oneWeekAgo } } },
      { $group: { _id: '$user', points: { $sum: 20 } } }
    ]);

    const aptitudePoints = await AptitudeTest.aggregate([
      { $match: { status: 'completed', completedAt: { $gte: oneWeekAgo } } },
      { $group: { _id: '$user', points: { $sum: '$score' } } }
    ]);

    const pointsMap = {};
    codingPoints.forEach(p => pointsMap[p._id] = (pointsMap[p._id] || 0) + p.points);
    aptitudePoints.forEach(p => pointsMap[p._id] = (pointsMap[p._id] || 0) + p.points);

    const userIds = Object.keys(pointsMap);
    const users = await User.find({ _id: { $in: userIds } }).select('name college department');

    const leaderboard = users.map(u => ({
      ...u.toObject(),
      weeklyPoints: pointsMap[u._id.toString()] || 0
    })).sort((a, b) => b.weeklyPoints - a.weeklyPoints)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
