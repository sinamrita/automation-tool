// bullmq/sendReply.js
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { sendEmail: sendGmailEmail } = require('../services/gmail');
const { sendEmail: sendOutlookEmail } = require('../services/outlook');
const { generateEmailReply } = require('../services/emailProcessor');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();


const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null, // Ensure this option is explicitly set to null
  retryStrategy: times => Math.min(times * 50, 2000) // Optional: retry logic
});

new Worker('sendReplyQueue', async (job) => {
  const { service, auth, to, subject, context } = job.data;

  console.log('Processing sendEmail job:', job.id, 'Service:', service, 'To:', to, 'Subject:', subject, 'Context:', context);

  try {
    if (!context) {
      throw new Error('Context is missing in job data');
    }

    const reply = await generateEmailReply(context);

    if (service === 'gmail') {
      await sendGmailEmail(auth, to, subject, reply);
    } else if (service === 'outlook') {
      await sendOutlookEmail(auth, to, subject, reply);
    }

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error processing sendEmail job:', error);
    throw error;
  }
}, { connection });

console.log('sendReplyQueue Worker started...');
