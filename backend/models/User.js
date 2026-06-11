const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  college: { type: String, default: '' },
  department: { type: String, default: '' },
  year: { type: Number, default: 1 },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  linkedIn: { type: String, default: '' },
  github: { type: String, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  totalPoints: { type: Number, default: 0 },
  badges: [{ name: String, description: String, earnedAt: Date, icon: String }],
  aptitudeStats: {
    totalAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    categoryScores: { type: Map, of: Number, default: {} }
  },
  codingStats: {
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    languagesUsed: [String]
  },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CodingQuestion' }],
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
