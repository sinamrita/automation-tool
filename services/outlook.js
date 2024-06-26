// services/outlook.js
const axios = require('axios');
const { outlookOAuth2Client } = require('./oauth');

const getOutlookToken = async (code) => {
  const tokenParams = {
    code,
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
    scope: 'Mail.Read Mail.Send',
  };

  const accessToken = await outlookOAuth2Client.authorizationCode.getToken(tokenParams);
  return outlookOAuth2Client.createToken(accessToken);
};

const getEmails = async (token) => {
  const response = await axios.get('https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages', {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
    },
    params: {
      '$filter': 'isRead eq false', // Fetch unread emails
    },
  });
  return response.data.value;
};

const sendEmail = async (token, to, subject, body) => {
  const emailData = {
    message: {
      subject,
      body: {
        contentType: 'Text',
        content: body,
      },
      toRecipients: [
        {
          emailAddress: {
            address: to,
          },
        },
      ],
    },
    saveToSentItems: 'true',
  };

  await axios.post('https://graph.microsoft.com/v1.0/me/sendMail', emailData, {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

module.exports = {
  getOutlookToken,
  getEmails,
  sendEmail,
};
