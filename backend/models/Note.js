const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  category: { type: String, enum: ['aptitude', 'coding', 'interview', 'general'], default: 'general' },
  tags: [{ type: String }],
  isPinned: { type: Boolean, default: false },
  color: { type: String, default: '#ffffff' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
