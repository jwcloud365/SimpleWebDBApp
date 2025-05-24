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
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
})); // Security headers with CSP configured for styles
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Static files
app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, path) => {
    console.log(`Serving static file: ${path}`);
  }
}));

// Explicitly serve the uploads directory for images with appropriate headers
app.use('/uploads', (req, res, next) => {
  // Add caching headers for images
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
  next();
}, express.static(path.join(__dirname, '../public/uploads')));

// Make sure uploads directory exists and is accessible
const uploadsPath = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Routes will be added by our route handlers

// API routes will be added later
// app.use('/api/pictures', require('./routes/pictures'));

// API routes
app.use('/api/pictures', require('./routes/pictures'));

// Frontend routes
app.use('/', require('./routes/pages'));

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
