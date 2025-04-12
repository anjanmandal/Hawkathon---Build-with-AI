// server/services/openaiService.js
const OpenAI = require('openai');
require('dotenv').config(); // if you need to load .env variables

// Initialize the new OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // You can also set other options, e.g.:
  // organization: 'org-id',
  // baseURL: 'https://api.openai.com/v1',
});

exports.getChatCompletion = async (messages) => {
  // `messages` is an array of message objects:
  //   [ { role: 'system', content: '...' },
  //     { role: 'user', content: '...' }, ... ]

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',    // or 'gpt-3.5-turbo', etc.
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    // Return the AI's text reply
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error calling the OpenAI API:', error);
    throw error;
  }
};
