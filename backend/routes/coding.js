const express = require('express');
const CodingQuestion = require('../models/CodingQuestion');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all questions
router.get('/questions', auth, async (req, res) => {
  try {
    const { category, difficulty, company, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (company) filter.company = { $in: [new RegExp(company, 'i')] };
    if (search) filter.title = new RegExp(search, 'i');

    const total = await CodingQuestion.countDocuments(filter);
    const questions = await CodingQuestion.find(filter)
      .select('-solution -testCases -starterCode')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get solved status for user
    const solvedIds = await Submission.distinct('question', {
      user: req.user._id,
      status: 'accepted'
    });

    const questionsWithStatus = questions.map(q => ({
      ...q.toObject(),
      isSolved: solvedIds.some(id => id.toString() === q._id.toString()),
      isBookmarked: req.user.bookmarks?.some(b => b.toString() === q._id.toString())
    }));

    res.json({ questions: questionsWithStatus, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single question
router.get('/questions/:id', auth, async (req, res) => {
  try {
    const question = await CodingQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const isSolved = await Submission.exists({ user: req.user._id, question: question._id, status: 'accepted' });
    const userSubmissions = await Submission.find({ user: req.user._id, question: question._id }).sort({ submittedAt: -1 }).limit(5);

    res.json({ ...question.toObject(), isSolved: !!isSolved, userSubmissions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit solution
router.post('/submit/:questionId', auth, async (req, res) => {
  try {
    const { code, language } = req.body;
    const question = await CodingQuestion.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Simulate test case evaluation (in real app, use Judge0 or similar)
    const totalTestCases = question.testCases.filter(tc => !tc.isHidden).length || 3;
    const passed = Math.floor(Math.random() * (totalTestCases + 1)); // Simulated
    const status = passed === totalTestCases ? 'accepted' : 'wrong-answer';

    const submission = new Submission({
      user: req.user._id,
      question: question._id,
      code,
      language,
      status,
      testCasesPassed: passed,
      totalTestCases,
      runtime: Math.floor(Math.random() * 200) + 10,
      memory: Math.floor(Math.random() * 50000) + 5000
    });
    await submission.save();

    // Update question stats
    await CodingQuestion.findByIdAndUpdate(question._id, {
      $inc: { totalAttempts: 1, ...(status === 'accepted' ? { totalSolved: 1 } : {}) }
    });

    // Update user stats if accepted for first time
    if (status === 'accepted') {
      const prevAccepted = await Submission.findOne({
        user: req.user._id, question: question._id, status: 'accepted',
        _id: { $ne: submission._id }
      });

      if (!prevAccepted) {
        const incField = `codingStats.${question.difficulty}Solved`;
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { 'codingStats.totalSolved': 1, [incField]: 1, totalPoints: question.points },
          $addToSet: { 'codingStats.languagesUsed': language }
        });
      }
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user submissions
router.get('/submissions', auth, async (req, res) => {
  try {
    const { questionId } = req.query;
    const filter = { user: req.user._id };
    if (questionId) filter.question = questionId;

    const submissions = await Submission.find(filter)
      .populate('question', 'title difficulty')
      .sort({ submittedAt: -1 })
      .limit(50);

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle bookmark
router.post('/bookmark/:questionId', auth, async (req, res) => {
  try {
    const user = req.user;
    const qId = req.params.questionId;
    const isBookmarked = user.bookmarks?.some(b => b.toString() === qId);

    if (isBookmarked) {
      await User.findByIdAndUpdate(user._id, { $pull: { bookmarks: qId } });
    } else {
      await User.findByIdAndUpdate(user._id, { $addToSet: { bookmarks: qId } });
    }

    res.json({ bookmarked: !isBookmarked });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bookmarks
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');
    res.json(user.bookmarks || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Add question
router.post('/questions', adminAuth, async (req, res) => {
  try {
    const question = new CodingQuestion(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get daily challenge
router.get('/daily-challenge', auth, async (req, res) => {
  try {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const count = await CodingQuestion.countDocuments();
    const skip = seed % count;
    const question = await CodingQuestion.findOne().skip(skip).select('-solution -testCases');
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// AI: Generate coding questions
router.post('/generate-ai', adminAuth, async (req, res) => {
  try {
    const { category = 'arrays', difficulty = 'easy', count = 5 } = req.body;

    const prompt = `Generate ${count} unique coding problems for placement exam preparation.
Category: ${category}
Difficulty: ${difficulty}

Return ONLY a valid JSON array, where each item has this exact structure:
{
  "title": "Problem Title",
  "description": "Detailed problem description",
  "difficulty": "${difficulty}",
  "category": "${category}",
  "points": 20,
  "constraints": "1 <= n <= 10^5",
  "examples": [{"input": "nums = [1,2]", "output": "3", "explanation": "1+2=3"}],
  "hints": ["Think about loops"],
  "company": ["General"]
}`;

    const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await aiRes.json();

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ message: 'Groq API error', details: data });
    }

    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);

    const saved = await CodingQuestion.insertMany(
      questions.map(q => ({ ...q, createdBy: req.user._id }))
    );

    res.json({ count: saved.length, questions: saved });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
