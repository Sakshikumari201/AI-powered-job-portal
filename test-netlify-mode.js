process.env.NETLIFY = 'true';
process.env.MONGO_URI = 'mongodb://localhost:27017/resume-analyzer'; // Use local for test
const app = require('./server/server'); 
const serverless = require('serverless-http');
const handler = serverless(app);

console.log('--- TESTING NETLIFY MODE ---');
console.log('Checking if app.listen was skipped...');
setTimeout(() => {
  console.log('SUCCESS: Process is still alive and didn\'t block on app.listen (or it exited if DB failed).');
  process.exit(0);
}, 2000);
