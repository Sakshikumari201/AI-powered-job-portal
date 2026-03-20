const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info({ host: conn.connection.host }, 'MongoDB connected');
  } catch (error) {
    logger.error({ err: error.message }, 'Error connecting to MongoDB');
    if (process.env.NETLIFY) {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
