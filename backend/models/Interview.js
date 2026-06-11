const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  package: { type: String, default: '' },
  rounds: [{
    roundName: String,
    description: String,
    questions: [String],
    tips: String
  }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  result: { type: String, enum: ['selected', 'rejected', 'pending', 'withdrew'], default: 'pending' },
  experience: { type: String, required: true },
  tips: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAnonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', interviewSchema);
