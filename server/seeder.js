const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');
const User = require('./models/User');
const jobs = require('./data/jobs');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Job.deleteMany();

    // Insert Jobs
    await Job.insertMany(jobs);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Job.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
