import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Internship from './models/Internship.js';

dotenv.config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careermatch');

async function test() {
  const count = await Internship.countDocuments();
  const activeCount = await Internship.countDocuments({ Application_Deadline: { $gte: new Date() } });
  console.log('Total internships:', count);
  console.log('Active internships:', activeCount);
  process.exit(0);
}
test();
