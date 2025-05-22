/**
 * Database Connection Module Tests
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Mock the sqlite3 module
jest.mock('sqlite3', () => {
  const mockDb = {
    close: jest.fn(callback => callback()),
    run: jest.fn((sql, callback) => callback && callback())
  };
  
  return {
    verbose: jest.fn().mockReturnThis(),
    Database: jest.fn().mockImplementation(() => mockDb)
  };
});

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));

describe('Database Connection Module', () => {
  let connectionModule;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    
    // Load the module fresh for each test
    jest.isolateModules(() => {
      connectionModule = require('../../database/connection');
    });
  });
  
  test('should create database directory if it does not exist', () => {
    // Setup mock to simulate directory not existing
    fs.existsSync.mockReturnValue(false);
    
    // Force reload the module to trigger directory creation
    jest.isolateModules(() => {
      connectionModule = require('../../database/connection');
    });
    
    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.mkdirSync).toHaveBeenCalled();
  });
  
  test('should create a new database connection when one does not exist', () => {
    const connection = connectionModule.getConnection();
    
    expect(sqlite3.Database).toHaveBeenCalledTimes(1);
    expect(connection).toBeDefined();
  });
  
  test('should return existing connection on subsequent calls', () => {
    // Get connection first time
    const connection1 = connectionModule.getConnection();
    
    // Clear mock to verify it's not called again
    sqlite3.Database.mockClear();
    
    // Get connection second time
    const connection2 = connectionModule.getConnection();
    
    // Should not create a new connection
    expect(sqlite3.Database).not.toHaveBeenCalled();
    
    // Should return the same connection
    expect(connection1).toBe(connection2);
  });
  
  test('should close the database connection when requested', () => {
    const connection = connectionModule.getConnection();
    connectionModule.closeConnection();
    
    expect(connection.close).toHaveBeenCalled();
  });
  
  test('should create a new connection after closing', () => {
    // Get initial connection
    const connection1 = connectionModule.getConnection();
    
    // Close the connection
    connectionModule.closeConnection();
    
    // Clear mock to verify it's called again
    sqlite3.Database.mockClear();
    
    // Get a new connection
    const connection2 = connectionModule.getConnection();
    
    // Should create a new connection
    expect(sqlite3.Database).toHaveBeenCalledTimes(1);
  });
});
