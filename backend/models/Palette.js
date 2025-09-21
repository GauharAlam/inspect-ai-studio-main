import mongoose from 'mongoose';

const PaletteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  colors: {
    type: [String],
    required: true,
  },
  website_url: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Palette = mongoose.model('Palette', PaletteSchema);
export default Palette;