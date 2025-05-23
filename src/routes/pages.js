/**
 * Route handlers for the frontend pages
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const picturesDao = require('../../database/picturesDao');

/**
 * GET /upload - Render the upload form page
 */
router.get('/upload', (req, res) => {
  res.render('upload', { 
    title: 'Upload Picture',
    success: req.query.success,
    error: req.query.error
  });
});

/**
 * GET /pictures/:id - Render the picture detail page
 */
router.get('/pictures/:id', async (req, res, next) => {
  try {    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      const error = new Error('Invalid picture ID');
      error.status = 400;
      return next(error);
    }
      const picture = await picturesDao.getById(id);
    
    if (!picture) {
      const error = new Error('Picture not found');
      error.status = 404;
      return next(error);
    }
    
    // Get thumbnails for this picture
    const thumbnails = await picturesDao.getThumbnails(id);
    
    // Add thumbnails to the picture object
    picture.thumbnails = thumbnails || [];
      
    res.render('detail', { 
      title: `Picture: ${picture.original_filename}`,
      picture,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET / - Render the homepage with gallery
 */
router.get('/', async (req, res, next) => {
  try {    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    
    const result = await picturesDao.getAll({ page, limit });
    
    res.render('index', { 
      title: 'Simple Picture Database',
      pictures: result.pictures,
      pagination: result.pagination,
      success: req.query.success,
      error: req.query.error,
      deleted: req.query.deleted === 'true'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
