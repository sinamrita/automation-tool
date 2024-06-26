const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { getEmails: getGmailEmails } = require('../services/gmail');
const { getEmails: getOutlookEmails } = require('../services/outlook');
const dotenv = require('dotenv');

dotenv.config();

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null, // Ensure this option is explicitly set to null
});
console.log( process.env.REDIS_HOST);
const worker = new Worker('fetchEmailsQueue', async (job) => {
  const { service, auth } = job.data;
  

  try {
    if (service === 'gmail') {
      const emails = await getGmailEmails(auth);
      console.log('Fetched Gmail emails:', emails);
      // Process emails...
    } else if (service === 'outlook') {
      const emails = await getOutlookEmails(auth);
      console.log('Fetched Outlook emails:', emails);
      // Process emails...
    }
  } catch (error) {
    console.error('Error processing job:', error);
    throw error; // Rethrow the error to mark the job as failed
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has been completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('Worker started...');
