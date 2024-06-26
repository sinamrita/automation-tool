// services/gmail.js
const { google } = require('googleapis');
const { googleOAuth2Client } = require('./oauth');

const gmail = google.gmail({ version: 'v1', auth: googleOAuth2Client });

const getEmails = async (auth) => {
  googleOAuth2Client.setCredentials(auth);

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
  });

  const messages = res.data.messages || [];
  console.log('Gmail API response:', res.data);

  const emails = [];
  for (const msg of messages) {
    const msgDetail = await gmail.users.messages.get({ userId: 'me', id: msg.id });
    const payload = msgDetail.data.payload;

    // Extract headers
    const headers = payload.headers;
    const subject = headers.find(header => header.name === 'Subject')?.value || 'No Subject';
    const from = headers.find(header => header.name === 'From')?.value || 'Unknown';

    // Extract body
    const parts = payload.parts || [];
    let body = '';
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf8');
        break;
      }
    }

    emails.push({ from, subject, body });
  }
  return emails;
};

const sendEmail = async (auth, to, subject, body) => {
  googleOAuth2Client.setCredentials(auth);

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body,
  ].join('\n');

  const encodedMessage = Buffer.from(message).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
};

module.exports = {
  getEmails,
  sendEmail,
};
