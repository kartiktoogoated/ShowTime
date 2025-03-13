import mongoose from 'mongoose';
import User from '../server/src/models/User';

const seedAdmin = async (): Promise<void> => {
  const adminExists = await User.findOne({ email: 'admin@example.com' });

  if (adminExists) {
    console.log('Admin already exists');
    return;
  }

  const admin = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword',
    role: 'ADMIN',
  });

  await admin.save();
  console.log('Admin user created!');
};

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error('MONGO_URI not defined in environment variables');
}

mongoose
  .connect(mongoUri)  // Options removed for Mongoose v6
  .then(() => {
    console.log('MongoDB connected');
    seedAdmin();
  })
  .catch((err: any) => console.error(err));
