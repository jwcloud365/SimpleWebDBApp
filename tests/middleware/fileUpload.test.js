/**
 * File Upload Middleware Tests
 */

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');

// Mock multer
jest.mock('multer', () => {
  const multerMock = jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => {
      req.file = {
        filename: 'test-image.jpg',
        originalname: 'original-test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        path: path.join(__dirname, '../../public/uploads/test-image.jpg')
      };
      next();
    })
  }));
  
  multerMock.diskStorage = jest.fn(() => ({}));
  
  return multerMock;
});

// Mock sharp
jest.mock('sharp', () => {
  return jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue({})
  }));
});

// Mock fs
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn()
}));

// Import the middleware under test
const fileUpload = require('../../src/middleware/fileUpload');

describe('File Upload Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock request, response, and next function
    req = {
      file: {
        filename: 'test-image.jpg',
        originalname: 'original-test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        path: path.join(__dirname, '../../public/uploads/test-image.jpg')
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Mock fs.existsSync to return true
    fs.existsSync.mockReturnValue(true);
  });
  
  // Test uploadPicture middleware setup
  test('uploadPicture should be configured with correct options', () => {
    expect(multer).toHaveBeenCalled();
    expect(multer.diskStorage).toHaveBeenCalled();
  });
  
  // Test resizeAndCreateThumbnail middleware
  test('resizeAndCreateThumbnail should create a thumbnail for a valid image', async () => {
    await fileUpload.resizeAndCreateThumbnail(req, res, next);
    
    // Should call sharp to resize the image
    expect(sharp).toHaveBeenCalledWith(req.file.path);
    expect(sharp().resize).toHaveBeenCalled();
    expect(sharp().toFile).toHaveBeenCalled();
    
    // Should add thumbnail info to the request
    expect(req.thumbnail).toBeDefined();
    expect(req.thumbnail.filename).toContain('thumbnail-');
    
    // Should call next middleware
    expect(next).toHaveBeenCalled();
  });
  
  // Test resizeAndCreateThumbnail with no file
  test('resizeAndCreateThumbnail should skip thumbnail creation if no file', async () => {
    // Remove file from request
    req.file = undefined;
    
    await fileUpload.resizeAndCreateThumbnail(req, res, next);
    
    // Should not call sharp
    expect(sharp).not.toHaveBeenCalled();
    
    // Should call next middleware
    expect(next).toHaveBeenCalled();
  });
  
  // Test resizeAndCreateThumbnail with error handling
  test('resizeAndCreateThumbnail should handle errors', async () => {
    // Setup sharp to throw an error
    sharp.mockImplementationOnce(() => {
      throw new Error('Thumbnail creation failed');
    });
    
    await fileUpload.resizeAndCreateThumbnail(req, res, next);
    
    // Should call next with an error
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
  
  // Test directory creation
  test('should create upload and thumbnail directories if they do not exist', () => {
    // Setup fs.existsSync to return false
    fs.existsSync.mockReturnValue(false);
    
    // Force re-import to trigger directory creation
    jest.resetModules();
    const fileUpload = require('../../src/middleware/fileUpload');
    
    expect(fs.mkdirSync).toHaveBeenCalled();
  });
});
