/**
 * Pictures DAO Tests
 */

const path = require('path');
const {
  TEST_DB_PATH,
  createTestDb,
  initTestDb,
  cleanupTestDb,
  insertTestPictures,
  generateSamplePictures
} = require('../helpers/db-helper');

// Mock the database connection module
jest.mock('../../database/connection', () => {
  const mockConnection = createTestDb();
  
  return {
    getConnection: jest.fn(() => mockConnection),
    closeConnection: jest.fn()
  };
});

// Import the module under test
const PicturesDAO = require('../../database/picturesDao');

describe('Pictures DAO', () => {
  let db;
  let testPictures;
  let testPictureIds;
  
  beforeAll(async () => {
    // Create and initialize test database
    db = createTestDb();
    await initTestDb(db);
    
    // Generate and insert test data
    testPictures = generateSamplePictures(5);
    testPictureIds = await insertTestPictures(db, testPictures);
  });
  
  afterAll(async () => {
    // Close test database connection
    await new Promise(resolve => db.close(resolve));
    
    // Clean up test database
    await cleanupTestDb();
  });
  
  // Test findAll method
  test('findAll should return all pictures', async () => {
    const pictures = await PicturesDAO.findAll();
    
    expect(pictures).toHaveLength(testPictures.length);
    
    // Verify the first picture
    expect(pictures[0]).toHaveProperty('id');
    expect(pictures[0].filename).toBe(testPictures[0].filename);
    expect(pictures[0].original_name).toBe(testPictures[0].original_name);
  });
  
  // Test findById method
  test('findById should return the correct picture', async () => {
    const id = testPictureIds[0];
    const picture = await PicturesDAO.findById(id);
    
    expect(picture).toHaveProperty('id', id);
    expect(picture.filename).toBe(testPictures[0].filename);
    expect(picture.original_name).toBe(testPictures[0].original_name);
  });
  
  // Test findById with non-existent ID
  test('findById should return null for non-existent ID', async () => {
    const picture = await PicturesDAO.findById(9999);
    
    expect(picture).toBeNull();
  });
  
  // Test create method
  test('create should insert a new picture and return its ID', async () => {
    const newPicture = {
      filename: 'new-test.jpg',
      original_name: 'New Test Image.jpg',
      description: 'A new test image',
      file_size: 2048,
      mime_type: 'image/jpeg'
    };
    
    const id = await PicturesDAO.create(newPicture);
    
    expect(id).toBeDefined();
    expect(typeof id).toBe('number');
    
    // Verify the picture was inserted
    const picture = await PicturesDAO.findById(id);
    expect(picture).toHaveProperty('id', id);
    expect(picture.filename).toBe(newPicture.filename);
    expect(picture.original_name).toBe(newPicture.original_name);
    expect(picture.description).toBe(newPicture.description);
  });
  
  // Test update method
  test('update should modify the picture details', async () => {
    const id = testPictureIds[1];
    const updatedData = {
      description: 'Updated description for test'
    };
    
    const success = await PicturesDAO.update(id, updatedData);
    
    expect(success).toBe(true);
    
    // Verify the picture was updated
    const picture = await PicturesDAO.findById(id);
    expect(picture.description).toBe(updatedData.description);
  });
  
  // Test update with non-existent ID
  test('update should return false for non-existent ID', async () => {
    const success = await PicturesDAO.update(9999, { description: 'Test' });
    
    expect(success).toBe(false);
  });
  
  // Test delete method
  test('delete should remove the picture', async () => {
    const id = testPictureIds[2];
    
    const success = await PicturesDAO.delete(id);
    
    expect(success).toBe(true);
    
    // Verify the picture was deleted
    const picture = await PicturesDAO.findById(id);
    expect(picture).toBeNull();
  });
  
  // Test delete with non-existent ID
  test('delete should return false for non-existent ID', async () => {
    const success = await PicturesDAO.delete(9999);
    
    expect(success).toBe(false);
  });
  
  // Test pagination with findAll
  test('findAll should support pagination', async () => {
    // Add more test pictures to ensure we have enough for pagination
    const morePictures = generateSamplePictures(10).map(p => ({
      ...p,
      filename: `pagination-${p.filename}`,
      original_name: `Pagination ${p.original_name}`
    }));
    
    await insertTestPictures(db, morePictures);
    
    // Test first page with 3 items per page
    const page1 = await PicturesDAO.findAll({ page: 1, limit: 3 });
    expect(page1.pictures).toHaveLength(3);
    expect(page1.pagination.totalPages).toBeGreaterThan(1);
    expect(page1.pagination.currentPage).toBe(1);
    
    // Test second page
    const page2 = await PicturesDAO.findAll({ page: 2, limit: 3 });
    expect(page2.pictures).toHaveLength(3);
    expect(page2.pagination.currentPage).toBe(2);
    
    // Verify different items on different pages
    const firstIdOnPage1 = page1.pictures[0].id;
    const firstIdOnPage2 = page2.pictures[0].id;
    expect(firstIdOnPage1).not.toBe(firstIdOnPage2);
  });
});
