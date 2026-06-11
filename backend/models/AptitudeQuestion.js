const mongoose = require('mongoose');

const aptitudeQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index of correct option
  explanation: { type: String, default: '' },
  category: {
    type: String,
    enum: ['quantitative', 'logical', 'verbal', 'data-interpretation', 'general-knowledge', 'technical'],
    required: true
  },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  company: { type: String, default: 'General' },
  tags: [{ type: String }],
  timeLimit: { type: Number, default: 60 }, // seconds
  points: { type: Number, default: 10 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);
