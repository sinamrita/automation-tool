// services/emailProcessor.js
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateEmailReply = async (context) => {
  const prompt = `Generate a reply for an email that says: "${context}". Reply with suitable follow-up questions or actions.`;
  console.log('Prompt for OpenAI:', prompt);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      prompt,
      max_tokens: 100,
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating email reply:', error);
    throw error;
  }
};

module.exports = {
  generateEmailReply,
};
