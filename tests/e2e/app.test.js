/**
 * End-to-end tests for the application
 * 
 * These tests validate the complete application functionality by simulating 
 * user interactions with the API and frontend endpoints.
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const app = require('../../src/app'); // We'll need to export the app from src/index.js
const dbConnection = require('../../database/connection');
const PicturesDAO = require('../../database/picturesDao');

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);

describe('End-to-End Tests', () => {
  const TEST_IMAGE_PATH = path.join(__dirname, '../fixtures/test-image.jpg');
  const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');
  let createdPictureId;
  
  beforeAll(async () => {
    // Ensure test image fixture exists
    if (!await exists(path.join(__dirname, '../fixtures'))) {
      await mkdir(path.join(__dirname, '../fixtures'), { recursive: true });
    }
    
    // Create a simple test image if it doesn't exist
    if (!await exists(TEST_IMAGE_PATH)) {
      // Create a small test image (1x1 pixel JPEG)
      const sampleImageBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 
        0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 
        0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
        0x00, 0x00, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
        0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x37, 
        0xff, 0xd9
      ]);
      
      await writeFile(TEST_IMAGE_PATH, sampleImageBuffer);
    }
    
    // Clear any existing test pictures from database
    try {
      // Find any pictures with "test" in the name
      const { pictures } = await PicturesDAO.findAll();
      
      for (const picture of pictures) {
        if (picture.original_name.toLowerCase().includes('test')) {
          await PicturesDAO.delete(picture.id);
          
          // Also delete the file if it exists
          const filePath = path.join(UPLOADS_DIR, picture.filename);
          if (await exists(filePath)) {
            await unlink(filePath);
          }
          
          // Delete thumbnail if it exists
          const thumbnailPath = path.join(UPLOADS_DIR, 'thumbnails', `thumbnail-${picture.filename}`);
          if (await exists(thumbnailPath)) {
            await unlink(thumbnailPath);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });
  
  afterAll(async () => {
    // Clean up any created test pictures
    if (createdPictureId) {
      try {
        const picture = await PicturesDAO.findById(createdPictureId);
        
        if (picture) {
          await PicturesDAO.delete(picture.id);
          
          // Also delete the file if it exists
          const filePath = path.join(UPLOADS_DIR, picture.filename);
          if (await exists(filePath)) {
            await unlink(filePath);
          }
          
          // Delete thumbnail if it exists
          const thumbnailPath = path.join(UPLOADS_DIR, 'thumbnails', `thumbnail-${picture.filename}`);
          if (await exists(thumbnailPath)) {
            await unlink(thumbnailPath);
          }
        }
      } catch (error) {
        console.error('Error cleaning up test data:', error);
      }
    }
    
    // Close database connection
    dbConnection.closeConnection();
  });
  
  // Test the homepage renders correctly
  test('Homepage should load successfully', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('Simple Picture Database');
    expect(response.text).toContain('Your Picture Gallery');
  });
  
  // Test the upload page renders correctly
  test('Upload page should load successfully', async () => {
    const response = await request(app).get('/upload');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('Upload New Picture');
    expect(response.text).toContain('Choose Image');
  });
  
  // Test uploading a picture
  test('Should upload a picture successfully', async () => {
    const response = await request(app)
      .post('/api/pictures')
      .attach('picture', TEST_IMAGE_PATH)
      .field('description', 'Test picture description for e2e testing');
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('message', 'Picture uploaded successfully');
    
    // Save the created picture ID for later tests
    createdPictureId = response.body.id;
  });
  
  // Test retrieving all pictures
  test('Should retrieve all pictures', async () => {
    const response = await request(app).get('/api/pictures');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('pictures');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.pictures)).toBe(true);
  });
  
  // Test retrieving a specific picture
  test('Should retrieve a specific picture', async () => {
    // Skip if no picture was created
    if (!createdPictureId) {
      return;
    }
    
    const response = await request(app).get(`/api/pictures/${createdPictureId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdPictureId);
    expect(response.body).toHaveProperty('description', 'Test picture description for e2e testing');
  });
  
  // Test updating a picture
  test('Should update a picture description', async () => {
    // Skip if no picture was created
    if (!createdPictureId) {
      return;
    }
    
    const newDescription = 'Updated test description';
    const response = await request(app)
      .put(`/api/pictures/${createdPictureId}`)
      .send({ description: newDescription });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Picture updated successfully');
    
    // Verify the update
    const pictureResponse = await request(app).get(`/api/pictures/${createdPictureId}`);
    expect(pictureResponse.body).toHaveProperty('description', newDescription);
  });
  
  // Test detail page
  test('Detail page should load successfully', async () => {
    // Skip if no picture was created
    if (!createdPictureId) {
      return;
    }
    
    const response = await request(app).get(`/pictures/${createdPictureId}`);
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('Picture Details');
    expect(response.text).toContain('Updated test description');
  });
  
  // Test thumbnail generation
  test('Should generate and serve thumbnails', async () => {
    // Skip if no picture was created
    if (!createdPictureId) {
      return;
    }
    
    const response = await request(app).get(`/api/pictures/${createdPictureId}/thumbnail`);
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/^image\//);
  });
  
  // Test deleting a picture
  test('Should delete a picture', async () => {
    // Skip if no picture was created
    if (!createdPictureId) {
      return;
    }
    
    const response = await request(app).delete(`/api/pictures/${createdPictureId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Picture deleted successfully');
    
    // Verify deletion
    const pictureResponse = await request(app).get(`/api/pictures/${createdPictureId}`);
    expect(pictureResponse.status).toBe(404);
    
    // Clear createdPictureId since it's been deleted
    createdPictureId = null;
  });
  
  // Test error handling - trying to get a non-existent picture
  test('Should handle non-existent picture requests gracefully', async () => {
    const response = await request(app).get('/api/pictures/99999');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
  
  // Test error page
  test('Error page should load for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');
    
    expect(response.status).toBe(404);
    expect(response.text).toContain('Error');
  });
});
