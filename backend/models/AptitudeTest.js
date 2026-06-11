const mongoose = require('mongoose');

const aptitudeTestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeQuestion' },
    selectedAnswer: { type: Number, default: -1 },
    isCorrect: { type: Boolean, default: false },
    timeTaken: { type: Number, default: 0 }
  }],
  category: { type: String, default: 'mixed' },
  difficulty: { type: String, default: 'mixed' },
  totalQuestions: { type: Number },
  correctAnswers: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // total seconds
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('AptitudeTest', aptitudeTestSchema);
