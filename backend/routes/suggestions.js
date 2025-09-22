import express from 'express';
import auth from '../middleware/auth.js';
import Suggestion from '../models/Suggestion.js';
import fetch from 'node-fetch'; // node-fetch install karna hoga

const router = express.Router();

// @route   GET api/suggestions
// @desc    Get all AI suggestions for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const suggestions = await Suggestion.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/suggestions/generate
// @desc    Generate AI suggestions
// @access  Private
router.post('/generate', auth, async (req, res) => {
  const { elementHtml, elementCss, websiteUrl } = req.body;

  // Gemini API key ko environment variables se lein
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on the server.' });
  }

  const systemPrompt = `You are an expert web design and accessibility consultant...`; // Supabase function se prompt copy karein

  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${AIzaSyD5pT3K8AY4GO_EVn5lwSktps1vHIwIBNw}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.2, topP: 0.8, maxOutputTokens: 1024 }
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const aiResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponseText) {
      throw new Error('No response from AI');
    }

    const cleanedResponse = aiResponseText.replace(/```json\n?|\n?```/g, '').trim();
    const suggestions = JSON.parse(cleanedResponse);

    // Save to MongoDB
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