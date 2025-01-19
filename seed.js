const bcrypt = require('bcrypt');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    });

    await admin.save();
    console.log('Admin user created');
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

seedAdmin();
