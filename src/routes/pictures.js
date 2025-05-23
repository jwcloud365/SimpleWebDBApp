/**
 * Pictures API routes
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const picturesDao = require('../../database/picturesDao');
const { upload, generateThumbnail } = require('../middleware/fileUpload');
const { validatePicture } = require('../middleware/validation');

// Enhanced logging helper
const logger = {
  log: (message, data = null) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[API][${timestamp}] ${message}`, data);
    } else {
      console.log(`[API][${timestamp}] ${message}`);
    }
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    if (error) {
      console.error(`[API][${timestamp}] ERROR: ${message}`, error);
    } else {
      console.error(`[API][${timestamp}] ERROR: ${message}`);
    }
  },
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.warn(`[API][${timestamp}] WARN: ${message}`, data);
    } else {
      console.warn(`[API][${timestamp}] WARN: ${message}`);
    }
  }
};

/**
 * @route   POST /api/pictures
 * @desc    Upload a new picture with description
 * @access  Public
 */
router.post('/', upload.single('picture'), validatePicture, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get the uploaded file details
    const { filename, originalname, mimetype, size } = req.file;
    const { description } = req.body;
      // Generate a thumbnail
    const thumbnail = await generateThumbnail(
      req.file.path
    );
    
    // Create the picture record in the database
    const picture = await picturesDao.create({
      filename,
      original_filename: originalname,
      description,
      mimetype,
      size
    });
    
    // Add thumbnail record
    await picturesDao.addThumbnail({
      picture_id: picture.id,
      filename: thumbnail.filename,
      width: thumbnail.width,
      height: thumbnail.height
    });
    
    res.status(201).json({
      message: 'Picture uploaded successfully',
      picture: {
        id: picture.id,
        filename,
        description,
        thumbnail: thumbnail.filename
      }
    });
  } catch (error) {
    // If there's an error, clean up the uploaded file
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file after upload error:', unlinkError.message);
      }
    }
    next(error);
  }
});

/**
 * @route   GET /api/pictures
 * @desc    Get all pictures with pagination
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const result = await picturesDao.getAll({ page, limit });
    
    // Add URL paths to the results
    result.pictures = result.pictures.map(picture => ({
      ...picture,
      url: `/uploads/${picture.filename}`,
      thumbnails: picture.thumbnails.map(thumb => ({
        ...thumb,
        url: `/uploads/${thumb.filename}`
      }))
    }));
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/pictures/:id
 * @desc    Get a specific picture by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid picture ID' });
    }
    
    const picture = await picturesDao.getById(id);
    
    if (!picture) {
      return res.status(404).json({ error: 'Picture not found' });
    }
    
    // Add URL to the picture
    picture.url = `/uploads/${picture.filename}`;
    
    res.json(picture);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/pictures/:id
 * @desc    Update a picture description
 * @access  Public
 */
router.put('/:id', validatePicture, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { description } = req.body;
    
    logger.log(`Update request for picture ID: ${id}`, {
      description: description,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    if (isNaN(id)) {
      logger.error(`Invalid picture ID: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid picture ID' });
    }
    
    const picture = await picturesDao.getById(id);
    if (!picture) {
      logger.error(`Picture not found for update: ${id}`);
      return res.status(404).json({ error: 'Picture not found' });
    }
    
    logger.log(`Found picture to update`, {
      id: picture.id,
      filename: picture.filename,
      oldDescription: picture.description,
      newDescription: description
    });
    
    const updated = await picturesDao.updateDescription(id, description);
    
    if (!updated) {
      logger.error(`Failed to update picture ${id} in database`);
      return res.status(404).json({ error: 'Failed to update picture description' });
    }
    
    logger.log(`Successfully updated picture ${id}`);
    
    res.json({ 
      message: 'Picture description updated successfully',
      description: description 
    });
  } catch (error) {
    logger.error(`Error updating picture description:`, error);
    next(error);
  }
});

/**
 * @route   DELETE /api/pictures/:id
 * @desc    Delete a picture and its thumbnails
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    logger.log(`Delete request for picture ID: ${id}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    if (isNaN(id)) {
      logger.error(`Invalid picture ID: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid picture ID' });
    }
    
    // Check if the picture exists first
    const picture = await picturesDao.getById(id);
    if (!picture) {
      logger.error(`Picture not found for deletion: ${id}`);
      return res.status(404).json({ error: 'Picture not found' });
    }
    
    logger.log(`Found picture to delete`, {
      id: picture.id,
      filename: picture.filename,
      mimetype: picture.mimetype,
      size: picture.size
    });
    
    const deleted = await picturesDao.delete(id);
    
    if (!deleted) {
      logger.error(`Failed to delete picture ${id}`);
      return res.status(500).json({ error: 'Failed to delete picture' });
    }
    
    logger.log(`Successfully deleted picture ${id}`);
    
    res.json({ message: 'Picture deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting picture:`, error);
    next(error);
  }
});

/**
 * @route   GET /api/pictures/:id/thumbnail
 * @desc    Get the thumbnail for a specific picture
 * @access  Public
 */
router.get('/:id/thumbnail', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid picture ID' });
    }
    
    const picture = await picturesDao.getById(id);
    
    if (!picture) {
      return res.status(404).json({ error: 'Picture not found' });
    }
      // Find the thumbnail for this picture
    const thumbnails = await picturesDao.getThumbnails(id);
    
    if (!thumbnails || thumbnails.length === 0) {
      // If no thumbnail exists, redirect to the original image as a fallback
      return res.redirect(`/uploads/${picture.filename}`);
    }
    
    // Get the first thumbnail (we might have multiple sizes in the future)
    const thumbnail = thumbnails[0];
    
    // Check if thumbnail file exists, if not use original image as fallback
    const thumbnailPath = path.join(__dirname, '../../public/uploads', thumbnail.filename);
    const originalPath = path.join(__dirname, '../../public/uploads', picture.filename);
    
    try {
      // Check if the thumbnail file exists
      await fs.access(thumbnailPath);
      // Thumbnail exists, redirect to it
      res.redirect(`/uploads/${thumbnail.filename}`);
    } catch (err) {
      // Thumbnail file doesn't exist, use original image as fallback
      try {
        await fs.access(originalPath);
        res.redirect(`/uploads/${picture.filename}`);
      } catch (origErr) {
        // Neither thumbnail nor original exists
        res.status(404).json({ error: 'Image file not found' });
      }
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
