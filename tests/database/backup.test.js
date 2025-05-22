/**
 * Database Backup Utilities Tests
 */

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const sqlite3 = require('sqlite3').verbose();

// Convert fs functions to promise-based
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const exists = promisify(fs.exists);

// Mock database connection module
jest.mock('../../database/connection', () => {
  const mockDb = {
    close: jest.fn(callback => callback()),
    get: jest.fn((sql, callback) => callback(null, { count: 5 })),
    all: jest.fn((sql, callback) => callback(null, [
      { name: 'pictures' },
      { name: 'sqlite_sequence' }
    ]))
  };
  
  return {
    getConnection: jest.fn(() => mockDb),
    closeConnection: jest.fn()
  };
});

// Mock fs module for controlled testing
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    existsSync: jest.fn(),
    mkdir: jest.fn(),
    copyFile: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn()
  };
});

// Import module under test
const backupUtils = require('../../database/backup');

describe('Database Backup Utilities', () => {
  // Backup directory path for testing
  const TEST_BACKUP_DIR = path.resolve(__dirname, '../../database/test-backups');
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock responses
    fs.existsSync.mockImplementation(path => {
      if (path.includes('database.sqlite')) return true;
      if (path.includes('test-backups')) return true;
      return false;
    });
    
    fs.mkdir.mockImplementation((path, options, callback) => {
      if (callback) callback(null);
      return Promise.resolve();
    });
    
    fs.copyFile.mockImplementation((src, dest, callback) => {
      if (callback) callback(null);
      return Promise.resolve();
    });
    
    fs.readdir.mockResolvedValue([
      'backup-2023-01-01-00-00-00.sqlite',
      'backup-2023-01-02-00-00-00.sqlite',
      'not-a-backup.txt'
    ]);
    
    fs.stat.mockImplementation((path, callback) => {
      const stats = {
        size: 1024,
        birthtime: new Date('2023-01-01')
      };
      if (callback) callback(null, stats);
      return Promise.resolve(stats);
    });
    
    // Override backup directory for testing
    backupUtils.BACKUP_DIR = TEST_BACKUP_DIR;
  });
  
  // Test createBackup method
  test('createBackup should create a backup file', async () => {
    const backupPath = await backupUtils.createBackup();
    
    // Verify directory check
    expect(fs.existsSync).toHaveBeenCalledWith(TEST_BACKUP_DIR);
    
    // Verify file copy operation
    expect(fs.copyFile).toHaveBeenCalled();
    
    // Should return a path to the backup file
    expect(backupPath).toContain(TEST_BACKUP_DIR);
    expect(backupPath).toMatch(/\.sqlite$/);
  });
  
  // Test createBackup with custom name
  test('createBackup should use custom name when provided', async () => {
    const customName = 'my-special-backup';
    const backupPath = await backupUtils.createBackup(customName);
    
    expect(backupPath).toContain(customName);
  });
  
  // Test createBackup when directory doesn't exist
  test('createBackup should create backup directory if it does not exist', async () => {
    // Setup mock to simulate directory not existing
    fs.existsSync.mockImplementation(path => {
      if (path.includes('database.sqlite')) return true;
      return false;
    });
    
    await backupUtils.createBackup();
    
    expect(fs.mkdir).toHaveBeenCalledWith(TEST_BACKUP_DIR, { recursive: true });
  });
  
  // Test listBackups method
  test('listBackups should return list of available backups', async () => {
    const backups = await backupUtils.listBackups();
    
    expect(backups).toHaveLength(2); // Only .sqlite files
    expect(backups[0].name).toMatch(/\.sqlite$/);
    expect(backups[0]).toHaveProperty('path');
    expect(backups[0]).toHaveProperty('size');
    expect(backups[0]).toHaveProperty('created');
  });
  
  // Test listBackups when no backups exist
  test('listBackups should return empty array when no backups exist', async () => {
    // Setup mock to simulate no backup directory
    fs.existsSync.mockReturnValue(false);
    
    const backups = await backupUtils.listBackups();
    
    expect(backups).toHaveLength(0);
  });
  
  // Test restoreFromBackup method
  test('restoreFromBackup should restore database from backup', async () => {
    // Setup mock to simulate backup file exists
    fs.existsSync.mockReturnValue(true);
    
    const result = await backupUtils.restoreFromBackup('test-backup.sqlite');
    
    // Should create a pre-restore backup
    expect(fs.copyFile).toHaveBeenCalledTimes(2);
    
    // Should return true on success
    expect(result).toBe(true);
  });
  
  // Test restoreFromBackup with non-existent backup
  test('restoreFromBackup should throw error if backup does not exist', async () => {
    // Setup mock to simulate backup file not existing
    fs.existsSync.mockImplementation(path => {
      if (path.includes('database.sqlite')) return true;
      return false;
    });
    
    await expect(backupUtils.restoreFromBackup('non-existent.sqlite'))
      .rejects.toThrow('Backup file not found');
  });
  
  // Test verifyBackup method
  test('verifyBackup should return information about a valid backup', async () => {
    const info = await backupUtils.verifyBackup('valid-backup.sqlite');
    
    expect(info.isValid).toBe(true);
    expect(info).toHaveProperty('tables');
    expect(info.tables).toHaveLength(2);
    expect(info.tables[0]).toHaveProperty('table');
    expect(info.tables[0]).toHaveProperty('records');
  });
  
  // Test verifyBackup with invalid backup
  test('verifyBackup should return error for invalid backup', async () => {
    // Setup a mock implementation that simulates an error
    const mockDb = {
      all: jest.fn((sql, callback) => callback(new Error('Invalid database'))),
      close: jest.fn(callback => callback())
    };
    
    // Mock sqlite3.Database constructor to return our mock
    sqlite3.Database = jest.fn(() => mockDb);
    
    const info = await backupUtils.verifyBackup('invalid-backup.sqlite');
    
    expect(info.isValid).toBe(false);
    expect(info).toHaveProperty('error');
  });
});
