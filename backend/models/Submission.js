const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingQuestion', required: true },
  code: { type: String, required: true },
  language: { type: String, enum: ['javascript', 'python', 'java', 'cpp'], required: true },
  status: { type: String, enum: ['accepted', 'wrong-answer', 'runtime-error', 'time-limit', 'pending'], default: 'pending' },
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  runtime: { type: Number, default: 0 }, // ms
  memory: { type: Number, default: 0 }, // KB
  notes: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
