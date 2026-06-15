const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const cron = require('node-cron');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/aptitude', require('./routes/aptitude'));
app.use('/api/coding', require('./routes/coding'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/users', require('./routes/users'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/notes', require('./routes/notes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

async function createAdmin() {
  try {
    const User = require('./models/User');
    const existing = await User.findOne({ email: 'maheswari@admin.com' });
    if (!existing) {
      const hash = await bcrypt.hash('admin123', 12);
      await User.create({ name: 'Maheswari Admin', email: 'maheswari@admin.com', password: hash, role: 'admin', totalPoints: 9999 });
      console.log('Admin created!');
    }
  } catch(e) { console.log(e); }
}

// ✅ Daily Auto Generate - Every day at 6:00 AM
async function dailyAutoGenerate() {
  try {
    const CodingQuestion = require('./models/CodingQuestion');
    const categories = ['arrays', 'strings', 'dp', 'trees', 'sorting'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    const prompt = `Generate 10 unique coding problems for placement exam preparation.
Category: ${category}
Difficulty: ${difficulty}

Return ONLY a valid JSON array, where each item has:
{
  "title": "Problem Title",
  "description": "Detailed problem description",
  "difficulty": "${difficulty}",
  "category": "${category}",
  "points": 20,
  "constraints": "1 <= n <= 10^5",
  "examples": [{"input": "example input", "output": "example output", "explanation": "why"}],
  "hints": ["hint 1"],
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
      console.error('Daily Cron - Groq error:', data);
      return;
    }

    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);

    await CodingQuestion.insertMany(questions);
    console.log(`✅ Daily Auto: ${questions.length} coding questions added! [${category} - ${difficulty}]`);
  } catch (err) {
    console.error('Daily Cron Error:', err.message);
  }
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    createAdmin();

    // ✅ Every day 6:00 AM auto generate
    cron.schedule('0 6 * * *', () => {
      console.log('⏰ Running daily question generation...');
      dailyAutoGenerate();
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;