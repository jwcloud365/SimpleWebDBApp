/**
 * Database connection module for Simple Picture Database
 * Provides a singleton database connection that can be reused across the application
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Get database path from environment variables or use default
const dbPath = process.env.DB_PATH || path.join(__dirname, 'pictures.db');

// Create a singleton database instance
let db = null;

/**
 * Get the database connection instance
 * @returns {sqlite3.Database} The database connection
 */
function getDatabase() {
  if (!db) {
    console.log(`Initializing database connection to ${dbPath}`);
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to database:', err.message);
        throw err;
      }
      console.log('Connected to the SQLite database');
      
      // Enable foreign keys for data integrity
      db.run('PRAGMA foreign_keys = ON');
    });
  }
  return db;
}

/**
 * Close the database connection
 * @returns {Promise<void>} A promise that resolves when the connection is closed
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
          reject(err);
          return;
        }
        console.log('Database connection closed');
        db = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  getDatabase,
  closeDatabase
};
