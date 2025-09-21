import express from 'express';
import auth from '../middleware/auth.js';
// We need a Suggestion model, let's create it.
import Suggestion from '../models/Suggestion.js';

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

export default router;