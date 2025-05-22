/**
 * Test Helpers for Database Tests
 * 
 * This module provides utility functions for setting up and tearing down
 * test database connections and test data.
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

// Test database path
const TEST_DB_PATH = path.resolve(__dirname, '../database/test-database.sqlite');

// Convert fs functions to promise-based
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);

/**
 * Create a test database connection
 * @returns {Object} SQLite database connection
 */
function createTestDb() {
  return new sqlite3.Database(TEST_DB_PATH);
}

/**
 * Initialize test database with schema
 * @param {Object} db - SQLite database connection
 * @returns {Promise<void>}
 */
async function initTestDb(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create pictures table
      db.run(`
        CREATE TABLE IF NOT EXISTS pictures (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          description TEXT,
          file_size INTEGER,
          mime_type TEXT,
          upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_date DATETIME
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

/**
 * Clean up test database
 * @returns {Promise<void>}
 */
async function cleanupTestDb() {
  // Close any open connections
  const db = new sqlite3.Database(TEST_DB_PATH);
  await new Promise(resolve => db.close(resolve));
  
  // Remove test database file if it exists
  if (await exists(TEST_DB_PATH)) {
    await unlink(TEST_DB_PATH);
  }
}

/**
 * Insert test picture data
 * @param {Object} db - SQLite database connection
 * @param {Array} pictures - Array of picture objects to insert
 * @returns {Promise<Array>} Array of inserted picture IDs
 */
async function insertTestPictures(db, pictures) {
  const insertPicture = promisify(db.run.bind(db, `
    INSERT INTO pictures (filename, original_name, description, file_size, mime_type)
    VALUES (?, ?, ?, ?, ?)
  `));
  
  const insertedIds = [];
  
  for (const picture of pictures) {
    await insertPicture(
      picture.filename,
      picture.original_name,
      picture.description,
      picture.file_size,
      picture.mime_type
    );
    
    // Get the last inserted ID
    const lastId = await new Promise((resolve, reject) => {
      db.get('SELECT last_insert_rowid() as id', (err, row) => {
        if (err) reject(err);
        else resolve(row.id);
      });
    });
    
    insertedIds.push(lastId);
  }
  
  return insertedIds;
}

/**
 * Generate sample test pictures
 * @param {number} count - Number of sample pictures to generate
 * @returns {Array} Array of sample picture objects
 */
function generateSamplePictures(count = 5) {
  const pictures = [];
  
  for (let i = 1; i <= count; i++) {
    pictures.push({
      filename: `test-${i}.jpg`,
      original_name: `Test Image ${i}.jpg`,
      description: `This is test image ${i}`,
      file_size: 1024 * i,
      mime_type: 'image/jpeg'
    });
  }
  
  return pictures;
}

module.exports = {
  TEST_DB_PATH,
  createTestDb,
  initTestDb,
  cleanupTestDb,
  insertTestPictures,
  generateSamplePictures
};
