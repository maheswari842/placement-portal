const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect('mongodb+srv://admin:Admin1234@cluster0.fnkzakt.mongodb.net/placement_portal?appName=Cluster0').then(async () => {
  const hash = await bcrypt.hash('Mahes@123', 12);
  await mongoose.connection.collection('users').updateOne(
    { email: 'mahes.admin@gmail.com' },
    { $set: { password: hash, role: 'admin' } }
  );
  console.log('Password fixed!');
  mongoose.disconnect();
});