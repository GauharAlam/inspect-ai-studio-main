// backend/routes/suggestions.js
import express from 'express';
import auth from '../middleware/auth.js';
import Suggestion from '../models/Suggestion.js';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const suggestions = await Suggestion.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.post('/generate', auth, async (req, res) => {
  const { elementHtml, elementCss, websiteUrl } = req.body;
  
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on the server.' });
  }

  const systemPrompt = `You are an expert web design and accessibility consultant. Given the HTML and CSS of a web element, provide actionable suggestions for improvement. Analyze the code for potential issues in these four categories: Accessibility, Performance, UI/UX, and Modern Practices.

  Your response must be a JSON array of objects. Each object must have three properties:
  1.  "title": A short, descriptive title for the suggestion (e.g., "Add ARIA Label").
  2.  "reason": A concise, one-sentence explanation of why this change is important.
  3.  "category": One of the four valid categories: "Accessibility", "Performance", "UI/UX", or "Modern Practices".

  Do not include any other text, markdown, or explanations outside of the JSON array.

  Here is the element to analyze:
  HTML:
  ${elementHtml}

  CSS:
  ${JSON.stringify(elementCss, null, 2)}
  `;

  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.2, topP: 0.8, maxOutputTokens: 1024, responseMimeType: "application/json" }
      })
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorBody}`);
    }

    const geminiData = await geminiResponse.json();
    const aiResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponseText) {
      throw new Error('No valid response from AI');
    }

    const suggestions = JSON.parse(aiResponseText);

    const newSuggestion = new Suggestion({
      user: req.user.id,
      element_html: elementHtml,
      suggestions: suggestions,
      website_url: websiteUrl,
    });
    await newSuggestion.save();

    res.json({ suggestions });

  } catch (error) {
    console.error('Error in AI suggestions route:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;