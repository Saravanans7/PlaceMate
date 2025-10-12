import axios from 'axios';
import mongoose from 'mongoose';
import { marked } from 'marked';
import InterviewExperience from '../models/InterviewExperience.js';

import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GENAI;

// 🔍 Extract company name from prompt (like "Tell me about Vel.ai interview")
function extractCompanyName(prompt) {
  const match = prompt.match(/(?:about|for)\s+([a-zA-Z.]+)/i);
  return match ? match[1].toLowerCase() : null;
}

export const postQueryToGemini = async (req, res) => {
  // console.log('gemini api key', GEMINI_API_KEY);
  try {
    const { userPrompt } = req.body;
    if (!userPrompt) {
      return res.status(400).json({ error: 'Please provide a userPrompt.' });
    }

    // 1️⃣ Extract company name or default
    const companyName = extractCompanyName(userPrompt) || 'presidio';

    // 2️⃣ Find only approved interview experiences for that company
    const experiences = await InterviewExperience.find({
      status: 'approved',
      companyNameCached: { $regex: new RegExp(companyName, 'i') }, // case-insensitive match
    });

    if (experiences.length === 0) {
      return res.json({
        response: `No approved interview experiences found for "${companyName}".`,
      });
    }

    // 3️⃣ Build context text from experiences
    const contextText = experiences
      .map(
        (exp, i) =>
          `Experience ${i + 1} (Company: ${exp.companyNameCached}):\n${
            exp.content
          }`
      )
      .join('\n\n');

    // 4️⃣ Create the final prompt for Gemini
    const fullPrompt = `
You are a helpful and friendly AI assistant that summarizes real interview experiences from students.

Use the following experiences to answer the user's query in a clear, student-friendly manner.

---
${contextText}
---

User asked: "${userPrompt}"

Now summarize the response clearly:
1. Mention how many rounds occurred and their types.
2. Highlight important technical or HR questions/topics.
3. Add useful preparation tips for that company.
`;

    // console.log('\ncontext text', fullPrompt);

    // 5️⃣ Send to Gemini
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: fullPrompt }] }],
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // 6️⃣ Extract Gemini’s reply
    const reply =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't find a clear answer.";
    const htmlResponse = marked(reply);
    res.json({ response: htmlResponse });
  } catch (error) {
    console.error('Error in postQueryToGemini:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
