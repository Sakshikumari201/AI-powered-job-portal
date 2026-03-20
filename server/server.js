const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { recordResponseTime } = require('./middleware/metricsMiddleware');
const { startJobCron } = require('./workers/jobCron');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(recordResponseTime);



// Import and use routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/analyze', require('./routes/analyzeRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));
app.use('/api/cover-letter', require('./routes/coverLetterRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));

const path = require('path');

// Serve frontend
if (process.env.NODE_ENV === 'production' && !process.env.NETLIFY) {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.use((req, res) =>
    res.sendFile(path.resolve(__dirname, '../', 'client', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('AI Resume Analyzer API is running...');
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

if (process.env.NODE_ENV !== 'test' && !process.env.NETLIFY) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV }, `Server running on port ${PORT}`);
    startJobCron();
  });
}
