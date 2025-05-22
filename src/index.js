/**
 * Main application entry point for Simple Picture Database Website
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: 'Simple Picture Database' });
});

// API routes will be added later
// app.use('/api/pictures', require('./routes/pictures'));

// API routes
app.use('/api/pictures', require('./routes/pictures'));

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode);
  res.render('error', {
    title: `Error ${statusCode}`,
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app; // Export for testing
