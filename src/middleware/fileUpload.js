/**
 * File upload middleware and utilities for Simple Picture Database
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Load configuration from environment variables
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml')
  .split(',')
  .map(type => type.trim());

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, 'picture-' + uniqueSuffix + ext);
  }
});

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  // Check if the file type is allowed
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`), false);
  }
};

// Create the multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

/**
 * Generate a thumbnail from an uploaded image
 * @param {string} sourceFilePath - Path to the source image
 * @param {Object} options - Thumbnail options
 * @param {number} options.width - Thumbnail width
 * @param {number} options.height - Thumbnail height (optional, will maintain aspect ratio if not provided)
 * @returns {Promise<Object>} - Object with thumbnail path and dimensions
 */
async function generateThumbnail(sourceFilePath, { width = 200, height = null } = {}) {
  try {
    // Get the filename and extension
    const basename = path.basename(sourceFilePath);
    const ext = path.extname(sourceFilePath);
    const filename = path.basename(basename, ext);
    
    // Create thumbnail filename
    const thumbnailFilename = `thumb-${filename}${ext}`;
    const thumbnailPath = path.join(uploadsDir, thumbnailFilename);
    
    // Check if the file is an SVG
    if (ext.toLowerCase() === '.svg' || path.basename(sourceFilePath).includes('.svg')) {
      // For SVG files, just copy the file since they're scalable by nature
      try {
        await fs.copyFile(sourceFilePath, thumbnailPath);
      } catch (e) {
        console.warn(`Could not copy SVG file from ${sourceFilePath} to ${thumbnailPath}: ${e.message}`);
        // Continue anyway with return values
      }
      
      // We don't have actual metadata, so let's return default values
      return {
        filename: thumbnailFilename,
        path: thumbnailPath,
        width: width || 200,
        height: height || 150
      };
    } else {
      // For other image types, use Sharp to resize
      const resizeOptions = { width };
      if (height) {
        resizeOptions.height = height;
      }
      
      const metadata = await sharp(sourceFilePath)
        .resize(resizeOptions)
        .toFile(thumbnailPath);
      
      return {
        filename: thumbnailFilename,
        path: thumbnailPath,
        width: metadata.width,
        height: metadata.height
      };
    }
  } catch (error) {
    console.error('Error generating thumbnail:', error.message);
    throw error;
  }
}

module.exports = {
  upload,
  generateThumbnail,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
};
