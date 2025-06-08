require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { CohereClient } = require('cohere-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Cohere client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Text summarization endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, language, tone } = req.body;

    const response = await cohere.generate({
      model: 'command',
      prompt: `Summarize the following text in ${language} with a ${tone} tone. Keep it concise.\n\nText: ${text}`,
      maxTokens: 150,
      temperature: 0.7,
    });

    res.json({ summary: response.generations[0].text.trim() });
  } catch (error) {
    console.error('Error summarizing text:', error);
    res.status(500).json({ error: 'Failed to summarize text' });
  }
});

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage, tone } = req.body;

    const response = await cohere.generate({
      model: 'command',
      prompt: `Translate the following text to ${targetLanguage} with a ${tone} tone. Maintain the original meaning.\n\nText: ${text}`,
      maxTokens: 300,
      temperature: 0.7,
    });

    res.json({ translation: response.generations[0].text.trim() });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

// Email generation endpoint
app.post('/api/generate-email', async (req, res) => {
  try {
    const { purpose, recipient, keyPoints, language, tone } = req.body;

    const response = await cohere.generate({
      model: 'command',
      prompt: `Generate a professional email in ${language} with a ${tone} tone.
Recipient: ${recipient}
Purpose: ${purpose}
Key points to include: ${keyPoints}`,
      maxTokens: 500,
      temperature: 0.7,
    });

    res.json({ email: response.generations[0].text.trim() });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ error: 'Failed to generate email' });
  }
});

// General chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, language, tone } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "'messages' field is required and must be an array" });
    }

    // Format the conversation history
    const conversation = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

    const response = await cohere.generate({
      model: 'command',
      prompt: `You are a helpful AI assistant. Respond in ${language} with a ${tone} tone. Be concise and helpful.\n\n${conversation}\nassistant:`,
      maxTokens: 300,
      temperature: 0.7,
    });

    res.json({ reply: response.generations[0].text.trim() });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});