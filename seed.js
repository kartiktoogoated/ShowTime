// seeders/seedAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  const adminExists = await User.findOne({ email: 'admin@example.com' });

  if (adminExists) {
    console.log('Admin already exists');
    return;
  }

  const admin = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword', // Make sure to hash this in your user model
    role: 'ADMIN',
  });

  await admin.save();
  console.log('Admin user created!');
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    seedAdmin();
  })
  .catch((err) => console.error(err));
