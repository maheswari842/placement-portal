const mongoose = require('mongoose');

const codingQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  category: {
    type: String,
    enum: ['arrays', 'strings', 'linked-list', 'trees', 'graphs', 'dp', 'sorting', 'searching', 'recursion', 'stack-queue', 'hashing', 'math', 'greedy', 'backtracking'],
    required: true
  },
  company: [{ type: String }],
  tags: [{ type: String }],
  constraints: { type: String, default: '' },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }],
  hints: [{ type: String }],
  solution: {
    approach: String,
    code: String,
    timeComplexity: String,
    spaceComplexity: String
  },
  starterCode: {
    javascript: { type: String, default: '// Write your solution here\n' },
    python: { type: String, default: '# Write your solution here\n' },
    java: { type: String, default: '// Write your solution here\n' },
    cpp: { type: String, default: '// Write your solution here\n' }
  },
  points: { type: Number, default: 20 },
  totalAttempts: { type: Number, default: 0 },
  totalSolved: { type: Number, default: 0 },
  acceptanceRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

codingQuestionSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('CodingQuestion', codingQuestionSchema);
