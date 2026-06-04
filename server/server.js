require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const trackerRoutes = require('./routes/trackerRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const skillsRoutes = require('./routes/skillsRoutes');
const errorHandler = require('./utils/errorHandler');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devpulse');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Ensure local MongoDB service is running, or double-check your MONGO_URI in .env');
    // We don't crash the server so the user has a chance to fix it or review the page.
  }
};

connectDB();

// Test API Route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'CampusPulse Career Assistant API Server is running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/skills', skillsRoutes);

// Centralized Error Handler (Must be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
