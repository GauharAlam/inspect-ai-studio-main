import mongoose from 'mongoose';

const SuggestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  element_html: {
    type: String,
    required: true,
  },
  suggestions: {
    type: Array,
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

const Suggestion = mongoose.model('Suggestion', SuggestionSchema);
export default Suggestion;