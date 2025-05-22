/**
 * Database initialization script for Simple Picture Database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Get database path from environment variables or use default
const dbPath = process.env.DB_PATH || path.join(__dirname, 'pictures.db');

// Create a new database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Create pictures table
  db.run(`
    CREATE TABLE IF NOT EXISTS pictures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      description TEXT,
      mimetype TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating pictures table:', err.message);
      process.exit(1);
    }
    console.log('Pictures table initialized successfully.');
    
    // Create thumbnails table
    db.run(`
      CREATE TABLE IF NOT EXISTS thumbnails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        picture_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (picture_id) REFERENCES pictures (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating thumbnails table:', err.message);
        process.exit(1);
      }
      console.log('Thumbnails table initialized successfully.');
      
      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
          process.exit(1);
        }
        console.log('Database initialized successfully.');
      });
    });
  });
});
