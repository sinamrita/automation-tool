    // services/oauth.js
const { google } = require('googleapis');
const simpleOauth2 = require('simple-oauth2');
const dotenv = require('dotenv');
const { AuthorizationCode } = require('simple-oauth2');


dotenv.config();

// Google OAuth2 Setup
const googleOAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

// Microsoft OAuth2 Setup
const outlookCredentials = {
  client: {
    id: process.env.OUTLOOK_CLIENT_ID,
    secret: process.env.OUTLOOK_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com/common',
    tokenPath: '/oauth2/v2.0/token',
    authorizePath: '/oauth2/v2.0/authorize',
  },
};

const outlookOAuth2Client = new  AuthorizationCode(outlookCredentials);

module.exports = {
  googleOAuth2Client,
  outlookOAuth2Client,
};
