const express = require('express');
const AptitudeQuestion = require('../models/AptitudeQuestion');
const AptitudeTest = require('../models/AptitudeTest');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all questions (with filters)
router.get('/questions', auth, async (req, res) => {
  try {
    const { category, difficulty, company, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (company) filter.company = new RegExp(company, 'i');

    const total = await AptitudeQuestion.countDocuments(filter);
    const questions = await AptitudeQuestion.find(filter)
      .select('-correctAnswer -explanation')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ questions, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start a test
router.post('/start-test', auth, async (req, res) => {
  try {
    const { category = 'mixed', difficulty = 'mixed', count = 20 } = req.body;
    const filter = {};
    if (category !== 'mixed') filter.category = category;
    if (difficulty !== 'mixed') filter.difficulty = difficulty;

    const questions = await AptitudeQuestion.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(count) } }
    ]);

    if (questions.length === 0) return res.status(404).json({ message: 'No questions found' });

    const test = new AptitudeTest({
      user: req.user._id,
      questions: questions.map(q => ({ question: q._id })),
      category, difficulty,
      totalQuestions: questions.length
    });
    await test.save();

    // Return questions without correct answers
    const safeQuestions = questions.map(q => {
      const { correctAnswer, explanation, ...safe } = q;
      return safe;
    });

    res.json({ testId: test._id, questions: safeQuestions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit test
router.post('/submit-test/:testId', auth, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body; // answers: [{questionId, selectedAnswer}]
    const test = await AptitudeTest.findById(req.params.testId).populate('questions.question');

    if (!test) return res.status(404).json({ message: 'Test not found' });
    if (test.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

    let correctAnswers = 0;
    const answerMap = {};
    answers.forEach(a => answerMap[a.questionId] = a.selectedAnswer);

    test.questions.forEach(q => {
      const selected = answerMap[q.question._id.toString()];
      q.selectedAnswer = selected !== undefined ? selected : -1;
      q.isCorrect = selected === q.question.correctAnswer;
      if (q.isCorrect) correctAnswers++;
    });

    const score = correctAnswers * 10;
    test.correctAnswers = correctAnswers;
    test.score = score;
    test.percentage = Math.round((correctAnswers / test.totalQuestions) * 100);
    test.timeTaken = timeTaken || 0;
    test.status = 'completed';
    test.completedAt = new Date();
    await test.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'aptitudeStats.totalAttempted': test.totalQuestions,
        'aptitudeStats.totalCorrect': correctAnswers,
        totalPoints: score
      }
    });

    // Return with correct answers for review
    const result = await AptitudeTest.findById(test._id).populate('questions.question');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get test history
router.get('/history', auth, async (req, res) => {
  try {
    const tests = await AptitudeTest.find({ user: req.user._id, status: 'completed' })
      .populate('questions.question')
      .sort({ completedAt: -1 })
      .limit(20);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Admin: Add question
router.post('/questions', adminAuth, async (req, res) => {
  try {
    const question = new AptitudeQuestion({ ...req.body, createdBy: req.user._id });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Bulk add questions
router.post('/questions/bulk', adminAuth, async (req, res) => {
  try {
    const { questions } = req.body;
    const created = await AptitudeQuestion.insertMany(
      questions.map(q => ({ ...q, createdBy: req.user._id }))
    );
    res.status(201).json({ count: created.length, questions: created });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get practice question (single)
router.get('/practice', auth, async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const [question] = await AptitudeQuestion.aggregate([
      { $match: filter },
      { $sample: { size: 1 } }
    ]);

    if (!question) return res.status(404).json({ message: 'No questions found' });

    const { correctAnswer, explanation, ...safe } = question;
    res.json(safe);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check single answer
router.post('/check-answer/:questionId', auth, async (req, res) => {
  try {
    const question = await AptitudeQuestion.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const { selectedAnswer } = req.body;
    const isCorrect = selectedAnswer === question.correctAnswer;

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
