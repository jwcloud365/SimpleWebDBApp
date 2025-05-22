/**
 * Database Backup and Restore Utilities
 * 
 * This module provides functionality to backup and restore the SQLite database.
 * It handles creating database snapshots and restoring from backup files.
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const dbConnection = require('./connection');

// Convert fs functions to promise-based
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);
const stat = promisify(fs.stat);

// Constants
const DB_PATH = path.resolve(__dirname, './database.sqlite');
const BACKUP_DIR = path.resolve(__dirname, './backups');

/**
 * Create a backup of the current database
 * @param {string} [backupName] - Optional custom name for the backup file
 * @returns {Promise<string>} Path to the created backup file
 */
async function createBackup(backupName) {
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      await mkdir(BACKUP_DIR, { recursive: true });
    }
    
    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = backupName 
      ? `${backupName}-${timestamp}.sqlite` 
      : `backup-${timestamp}.sqlite`;
    const backupPath = path.join(BACKUP_DIR, backupFilename);
    
    // Close any open database connections to ensure a clean backup
    const db = dbConnection.getConnection();
    await new Promise((resolve, reject) => {
      db.close(err => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Copy the database file to the backup location
    await copyFile(DB_PATH, backupPath);
    
    // Reopen the database connection
    dbConnection.getConnection();
    
    console.log(`Database backup created successfully: ${backupFilename}`);
    return backupPath;
  } catch (error) {
    console.error('Error creating database backup:', error);
    throw new Error(`Failed to create database backup: ${error.message}`);
  }
}

/**
 * List all available database backups
 * @returns {Promise<Array>} Array of backup file information (name, path, size, date)
 */
async function listBackups() {
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      return [];
    }
    
    // Get list of backup files
    const files = await readdir(BACKUP_DIR);
    const backupFiles = files.filter(file => file.endsWith('.sqlite'));
    
    // Get details for each backup file
    const backupDetails = await Promise.all(
      backupFiles.map(async file => {
        const filePath = path.join(BACKUP_DIR, file);
        const fileStat = await stat(filePath);
        
        return {
          name: file,
          path: filePath,
          size: fileStat.size,
          created: fileStat.birthtime
        };
      })
    );
    
    // Sort by creation date (newest first)
    return backupDetails.sort((a, b) => b.created - a.created);
  } catch (error) {
    console.error('Error listing database backups:', error);
    throw new Error(`Failed to list database backups: ${error.message}`);
  }
}

/**
 * Restore database from a backup file
 * @param {string} backupPath - Path to the backup file
 * @returns {Promise<boolean>} True if restore was successful
 */
async function restoreFromBackup(backupPath) {
  try {
    // Validate backup file exists
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    // Create a backup of current state before restoring
    await createBackup('pre-restore');
    
    // Close any open database connections
    const db = dbConnection.getConnection();
    await new Promise((resolve, reject) => {
      db.close(err => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Copy the backup file to the database location
    await copyFile(backupPath, DB_PATH);
    
    // Reopen the database connection
    dbConnection.getConnection();
    
    console.log(`Database restored successfully from: ${backupPath}`);
    return true;
  } catch (error) {
    console.error('Error restoring database from backup:', error);
    throw new Error(`Failed to restore database: ${error.message}`);
  }
}

/**
 * Verify a backup file is valid and can be restored
 * @param {string} backupPath - Path to the backup file to verify
 * @returns {Promise<object>} Information about the backup file
 */
async function verifyBackup(backupPath) {
  try {
    // Check if file exists
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    // Try opening the database file to verify it's valid
    const db = new sqlite3.Database(backupPath, sqlite3.OPEN_READONLY);
    
    // Check if it contains the expected tables
    const tables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.name));
      });
    });
    
    // Get record counts for each table
    const tableStats = await Promise.all(
      tables.map(async table => {
        const count = await new Promise((resolve, reject) => {
          db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
          });
        });
        
        return { table, records: count };
      })
    );
    
    // Close the test connection
    await new Promise(resolve => db.close(resolve));
    
    // Get file info
    const fileStat = await stat(backupPath);
    
    return {
      path: backupPath,
      size: fileStat.size,
      created: fileStat.birthtime,
      tables: tableStats,
      isValid: true
    };
  } catch (error) {
    console.error('Error verifying backup file:', error);
    return {
      path: backupPath,
      error: error.message,
      isValid: false
    };
  }
}

module.exports = {
  createBackup,
  listBackups,
  restoreFromBackup,
  verifyBackup,
  BACKUP_DIR
};
