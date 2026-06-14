const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/placement_portal').then(async () => {
  await mongoose.connection.collection('users').updateOne(
    { email: 'mahes.admin@gmail.com' },
    { $set: { role: 'admin' } }
  );
  console.log('Admin done!');
  mongoose.disconnect();
});