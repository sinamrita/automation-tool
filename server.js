// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { googleOAuth2Client, outlookOAuth2Client } = require('./services/oauth');
const { getEmails: getGmailEmails, sendEmail: sendGmailEmail } = require('./services/gmail');
const { getOutlookToken, getEmails: getOutlookEmails, sendEmail: sendOutlookEmail } = require('./services/outlook');
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const redisConnection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const fetchEmailsQueue = new Queue('fetchEmailsQueue', { connection: redisConnection });
const sendReplyQueue = new Queue('sendReplyQueue', { connection: redisConnection });

app.use(bodyParser.json());

app.get('/auth', (req, res) => {
  const url = googleOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
  });
  res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  console.log('Auth code:', code);

  try {
    const { tokens } = await googleOAuth2Client.getToken(code);
    googleOAuth2Client.setCredentials(tokens);

    // Fetch Gmail emails dynamically after authentication
    const emails = await getGmailEmails(tokens);

    // Add each email to the processing queue
    for (const email of emails) {
      const { from, subject, body } = email;
      await sendReplyQueue.add('sendEmail', {
        service: 'gmail',
        auth: tokens,
        to: from,  // Reply to the sender
        subject: `Re: ${subject}`,  // Respond to the same subject
        context: body
      });
    }

    res.send('Gmail authenticated and emails are being processed.');
  } catch (error) {
    console.error('Error during authentication or adding jobs to queue:', error);
    res.status(500).send('Error during authentication or adding jobs to queue');
  }
});

app.get('/auth/outlook', (req, res) => {
  const authUrl = outlookOAuth2Client.authorizationCode.authorizeURL({
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
    scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send',
  });
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  console.log('Outlook Auth code:', code);

  try {
    // Exchange the authorization code for Outlook token
    const token = await getOutlookToken(code);

    // Fetch Outlook emails after authentication
    const emails = await getOutlookEmails(token);

    // Add each unread email to the processing queue
    for (const email of emails) {
      const from = email.from.emailAddress.address;
      const subject = email.subject;
      const body = email.body.content;

      await sendReplyQueue.add('sendEmail', {
        service: 'outlook',
        auth: token.token,
        to: from,  // Reply to the sender
        subject: `Re: ${subject}`,  // Respond to the same subject
        context: body
      });
    }

    res.send('Outlook authenticated and emails are being processed.');
  } catch (error) {
    console.error('Error during Outlook authentication or adding jobs to queue:', error);
    res.status(500).send('Error during Outlook authentication or adding jobs to queue');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
