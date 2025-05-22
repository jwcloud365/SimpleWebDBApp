/**
 * Pictures API Endpoints Tests
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const express = require('express');

// Mock the pictures DAO
jest.mock('../../database/picturesDao', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

// Mock the file upload middleware
jest.mock('../../src/middleware/fileUpload', () => ({
  uploadPicture: jest.fn((req, res, next) => {
    // Simulate a successful file upload
    req.file = {
      filename: 'test-image.jpg',
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      path: '/uploads/test-image.jpg'
    };
    next();
  }),
  resizeAndCreateThumbnail: jest.fn((req, res, next) => {
    // Simulate thumbnail creation
    req.thumbnail = {
      filename: 'thumbnail-test-image.jpg',
      path: '/uploads/thumbnails/thumbnail-test-image.jpg'
    };
    next();
  })
}));

// Import the picturesDAO for mocking
const PicturesDAO = require('../../database/picturesDao');

// Create a test Express app
const app = express();
app.use(express.json());

// Import the routes we want to test
const picturesRoutes = require('../../src/routes/pictures');
app.use('/api/pictures', picturesRoutes);

describe('Pictures API Endpoints', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });
  
  // Test GET /api/pictures
  test('GET /api/pictures should return all pictures', async () => {
    // Setup mock response
    const mockPictures = {
      pictures: [
        {
          id: 1,
          filename: 'test1.jpg',
          original_name: 'Test Image 1.jpg',
          description: 'Test description 1',
          file_size: 1024,
          mime_type: 'image/jpeg',
          upload_date: '2023-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          filename: 'test2.jpg',
          original_name: 'Test Image 2.jpg',
          description: 'Test description 2',
          file_size: 2048,
          mime_type: 'image/jpeg',
          upload_date: '2023-01-02T00:00:00.000Z'
        }
      ],
      pagination: {
        totalItems: 2,
        currentPage: 1,
        pageSize: 10,
        totalPages: 1
      }
    };
    
    PicturesDAO.findAll.mockResolvedValue(mockPictures);
    
    const response = await request(app).get('/api/pictures');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('pictures');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pictures).toHaveLength(2);
  });
  
  // Test GET /api/pictures with pagination
  test('GET /api/pictures should support pagination parameters', async () => {
    // Setup mock response
    const mockPictures = {
      pictures: [{ id: 1, filename: 'test1.jpg' }],
      pagination: {
        totalItems: 15,
        currentPage: 2,
        pageSize: 5,
        totalPages: 3
      }
    };
    
    PicturesDAO.findAll.mockResolvedValue(mockPictures);
    
    const response = await request(app)
      .get('/api/pictures')
      .query({ page: 2, limit: 5 });
    
    expect(response.status).toBe(200);
    expect(PicturesDAO.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
    expect(response.body.pagination.currentPage).toBe(2);
    expect(response.body.pagination.pageSize).toBe(5);
  });
  
  // Test GET /api/pictures/:id
  test('GET /api/pictures/:id should return a specific picture', async () => {
    // Setup mock response
    const mockPicture = {
      id: 1,
      filename: 'test1.jpg',
      original_name: 'Test Image 1.jpg',
      description: 'Test description',
      file_size: 1024,
      mime_type: 'image/jpeg',
      upload_date: '2023-01-01T00:00:00.000Z'
    };
    
    PicturesDAO.findById.mockResolvedValue(mockPicture);
    
    const response = await request(app).get('/api/pictures/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body.filename).toBe('test1.jpg');
  });
  
  // Test GET /api/pictures/:id with non-existent ID
  test('GET /api/pictures/:id should return 404 for non-existent picture', async () => {
    PicturesDAO.findById.mockResolvedValue(null);
    
    const response = await request(app).get('/api/pictures/999');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
  
  // Test POST /api/pictures
  test('POST /api/pictures should create a new picture', async () => {
    // Setup mock response
    PicturesDAO.create.mockResolvedValue(1);
    
    const response = await request(app)
      .post('/api/pictures')
      .field('description', 'Test upload description')
      .attach('picture', Buffer.from('fake image data'), 'test-image.jpg');
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('message', 'Picture uploaded successfully');
    expect(PicturesDAO.create).toHaveBeenCalled();
  });
  
  // Test PUT /api/pictures/:id
  test('PUT /api/pictures/:id should update picture description', async () => {
    // Setup mock responses
    PicturesDAO.findById.mockResolvedValue({
      id: 1,
      filename: 'test1.jpg',
      description: 'Old description'
    });
    PicturesDAO.update.mockResolvedValue(true);
    
    const response = await request(app)
      .put('/api/pictures/1')
      .send({ description: 'Updated description' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Picture updated successfully');
    expect(PicturesDAO.update).toHaveBeenCalledWith(1, { description: 'Updated description', updated_date: expect.any(String) });
  });
  
  // Test PUT /api/pictures/:id with non-existent ID
  test('PUT /api/pictures/:id should return 404 for non-existent picture', async () => {
    PicturesDAO.findById.mockResolvedValue(null);
    
    const response = await request(app)
      .put('/api/pictures/999')
      .send({ description: 'Updated description' });
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
  
  // Test DELETE /api/pictures/:id
  test('DELETE /api/pictures/:id should delete a picture', async () => {
    // Setup mock responses
    PicturesDAO.findById.mockResolvedValue({
      id: 1,
      filename: 'test1.jpg'
    });
    PicturesDAO.delete.mockResolvedValue(true);
    
    const response = await request(app).delete('/api/pictures/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Picture deleted successfully');
    expect(PicturesDAO.delete).toHaveBeenCalledWith(1);
  });
  
  // Test DELETE /api/pictures/:id with non-existent ID
  test('DELETE /api/pictures/:id should return 404 for non-existent picture', async () => {
    PicturesDAO.findById.mockResolvedValue(null);
    
    const response = await request(app).delete('/api/pictures/999');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});
