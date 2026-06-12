const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
// Auto create admin on first run
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const existing = await User.findOne({ email: 'maheswari@admin.com' });
  if (!existing) {
    const hash = await bcrypt.hash('admin123', 12);
    await User.create({ name: 'Maheswari Admin', email: 'maheswari@admin.com', password: hash, role: 'admin', totalPoints: 9999 });
    console.log('Admin created!');
  }
}
mongoose.connection.once('open', createAdmin);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/aptitude', require('./routes/aptitude'));
app.use('/api/coding', require('./routes/coding'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/users', require('./routes/users'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/notes', require('./routes/notes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server is running' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
