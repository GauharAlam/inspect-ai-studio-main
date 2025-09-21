import express from 'express';
import auth from '../middleware/auth.js';
// We need a Palette model, let's create it.
import Palette from '../models/Palette.js';

const router = express.Router();

// @route   GET api/palettes
// @desc    Get all saved palettes for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const palettes = await Palette.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(palettes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/palettes
// @desc    Delete a palette
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        const { id } = req.query;
        let palette = await Palette.findById(id);

        if (!palette) {
            return res.status(404).json({ msg: 'Palette not found' });
        }

        // Make sure user owns palette
        if (palette.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Palette.findByIdAndDelete(id);

        res.json({ msg: 'Palette removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


export default router;