// backend/server.js

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
// FIX: File extension .js add kiya gaya hai
import authRoutes from './routes/auth.js'; 
import profileRoutes from './routes/profile.js';
import paletteRoutes from './routes/palettes.js';
import suggestionRoutes from './routes/suggestions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:8080', // Your frontend URL
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