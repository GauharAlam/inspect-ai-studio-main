// backend/server.js

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import paletteRoutes from './routes/palettes.js';
import suggestionRoutes from './routes/suggestions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// FIX: Allow requests from the Chrome extension origin
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && origin.startsWith('chrome-extension://')) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  }
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('chrome-extension://') || origin === 'http://localhost:8080') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/palettes', paletteRoutes);
app.use('/api/suggestions', suggestionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});