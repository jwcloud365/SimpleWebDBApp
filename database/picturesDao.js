/**
 * Pictures Data Access Object (DAO)
 * Provides methods to interact with the pictures table in the database
 */

const { run, get, all, transaction } = require('./utils');
const path = require('path');
const fs = require('fs').promises;

// Enhanced logging helper
const logger = {
  log: (message, data = null) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[DAO][${timestamp}] ${message}`, data);
    } else {
      console.log(`[DAO][${timestamp}] ${message}`);
    }
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    if (error) {
      console.error(`[DAO][${timestamp}] ERROR: ${message}`, error);
    } else {
      console.error(`[DAO][${timestamp}] ERROR: ${message}`);
    }
  },
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.warn(`[DAO][${timestamp}] WARN: ${message}`, data);
    } else {
      console.warn(`[DAO][${timestamp}] WARN: ${message}`);
    }
  }
};

class PicturesDAO {
  /**
   * Create a new picture record in the database
   * @param {Object} picture - The picture data
   * @param {string} picture.filename - The saved filename
   * @param {string} picture.original_filename - The original uploaded filename
   * @param {string} picture.description - The picture description
   * @param {string} picture.mimetype - The MIME type of the picture
   * @param {number} picture.size - The file size in bytes
   * @returns {Promise<Object>} - The created picture with ID
   */
  async create(picture) {
    try {
      const result = await run(
        `INSERT INTO pictures (filename, original_filename, description, mimetype, size)
         VALUES (?, ?, ?, ?, ?)`,
        [
          picture.filename,
          picture.original_filename,
          picture.description,
          picture.mimetype,
          picture.size
        ]
      );
      
      logger.log('Picture created:', { id: result.lastID, ...picture });
      
      return {
        id: result.lastID,
        ...picture
      };
    } catch (error) {
      logger.error('Error creating picture:', error);
      throw error;
    }
  }
  
  /**
   * Get a picture by ID
   * @param {number} id - The picture ID
   * @returns {Promise<Object|null>} - The picture or null if not found
   */
  async getById(id) {
    try {
      const picture = await get(
        `SELECT id, filename, original_filename, description, mimetype, size, 
                created_at, updated_at
         FROM pictures
         WHERE id = ?`,
        [id]
      );
      
      logger.log('Picture retrieved by ID:', { id, picture });
      
      return picture;
    } catch (error) {
      logger.error(`Error getting picture with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all pictures with optional pagination
   * @param {Object} options - The query options
   * @param {number} options.page - The page number (1-based)
   * @param {number} options.limit - The number of items per page
   * @returns {Promise<Object>} - Object containing pictures and pagination info
   */
  async getAll({ page = 1, limit = 10 } = {}) {
    try {
      // Ensure page and limit are valid numbers
      page = Math.max(1, parseInt(page, 10) || 1);
      limit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
      
      const offset = (page - 1) * limit;
      
      // Get the total count of pictures
      const countResult = await get('SELECT COUNT(*) as total FROM pictures');
      const total = countResult.total;
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      // Get the pictures for the requested page
      const pictures = await all(
        `SELECT id, filename, original_filename, description, mimetype, size, 
                created_at, updated_at
         FROM pictures
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      // Also fetch thumbnail information for each picture
      for (const picture of pictures) {
        picture.thumbnails = await all(
          `SELECT id, filename, width, height
           FROM thumbnails
           WHERE picture_id = ?`,
          [picture.id]
        );
      }
      
      logger.log('Pictures retrieved:', { page, limit, total, totalPages });
      
      return {
        pictures,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      };
    } catch (error) {
      logger.error('Error getting pictures:', error);
      throw error;
    }
  }
  
  /**
   * Update a picture description
   * @param {number} id - The picture ID
   * @param {string} description - The new description
   * @returns {Promise<boolean>} - True if updated, false if not found
   */
  async updateDescription(id, description) {
    try {
      logger.log(`Starting update of description for picture ${id}`, {
        id,
        newDescription: description,
        descriptionLength: description ? description.length : 0
      });
      
      // Get current picture data first for logging
      const currentPicture = await this.getById(id);
      if (!currentPicture) {
        logger.error(`Cannot update picture ${id} - not found in database`);
        return false;
      }
      
      logger.log(`Current picture data before update:`, {
        id: currentPicture.id,
        currentDescription: currentPicture.description,
        filename: currentPicture.filename
      });
      
      const result = await run(
        `UPDATE pictures
         SET description = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [description, id]
      );
      
      const updated = result.changes > 0;
      
      if (updated) {
        logger.log(`Successfully updated picture ${id} description`, {
          id,
          oldDescription: currentPicture.description,
          newDescription: description,
          changes: result.changes
        });
      } else {
        logger.error(`Failed to update picture ${id} - no rows changed`, {
          id,
          description,
          currentPicture
        });
      }
      
      return updated;
    } catch (error) {
      logger.error(`Error updating picture ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a picture and its associated thumbnails
   * @param {number} id - The picture ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */  async delete(id) {
    try {
      logger.log(`Starting deletion of picture ${id}`);
      
      // Use a transaction to ensure both database and files are deleted
      const result = await transaction(async (txn) => {
        // Get full picture details before deletion for better logging
        const picture = await txn.get(
          'SELECT id, filename, original_filename, mimetype, size FROM pictures WHERE id = ?',
          [id]
        );
        
        if (!picture) {
          logger.error(`Picture ${id} not found for deletion`);
          return false;
        }
        
        logger.log(`Found picture to delete:`, picture);
        
        const thumbnails = await txn.all(
          'SELECT id, filename, width, height FROM thumbnails WHERE picture_id = ?',
          [id]
        );
        
        logger.log(`Found ${thumbnails.length} thumbnails for picture ${id}`, thumbnails);
        
        // Delete from database (thumbnails will be deleted via foreign key cascade)
        const dbResult = await txn.run(
          'DELETE FROM pictures WHERE id = ?',
          [id]
        );
        
        if (dbResult.changes === 0) {
          logger.error(`Failed to delete picture ${id} from database - no rows affected`);
          return false;
        }
        
        logger.log(`Picture ${id} deleted from database successfully`, { 
          changes: dbResult.changes,
          lastID: dbResult.lastID 
        });
        
        // Delete the actual files (in a real app, these operations would be made more robust)
        const uploadsDir = path.join(__dirname, '../public/uploads');
        
        // Delete picture file
        try {
          const picturePath = path.join(uploadsDir, picture.filename);
          logger.log(`Deleting picture file: ${picturePath}`);
          
          await fs.access(picturePath).then(
            async () => {
              await fs.unlink(picturePath);
              logger.log(`Successfully deleted picture file: ${picture.filename}`);
            },
            () => {
              logger.warn(`Picture file not found at ${picturePath}`);
            }
          );
        } catch (fileError) {
          logger.warn(`Could not delete picture file ${picture.filename}:`, fileError);
          // Continue with other deletions
        }
        
        // Delete thumbnail files
        let deletedThumbnails = 0;
        let failedThumbnails = 0;
        
        for (const thumbnail of thumbnails) {
          try {
            const thumbnailPath = path.join(uploadsDir, thumbnail.filename);
            logger.log(`Deleting thumbnail file: ${thumbnailPath}`);
            
            await fs.access(thumbnailPath).then(
              async () => {
                await fs.unlink(thumbnailPath);
                logger.log(`Successfully deleted thumbnail file: ${thumbnail.filename}`);
                deletedThumbnails++;
              },
              () => {
                logger.warn(`Thumbnail file not found at ${thumbnailPath}`);
                failedThumbnails++;
              }
            );
          } catch (fileError) {
            logger.warn(`Could not delete thumbnail file ${thumbnail.filename}:`, fileError);
            failedThumbnails++;
            // Continue with other deletions
          }
        }
        
        logger.log(`File deletion summary for picture ${id}:`, {
          totalThumbnails: thumbnails.length,
          deletedThumbnails,
          failedThumbnails
        });
          return true;
      });
      
      return result;
    } catch (error) {
      logger.error(`Error deleting picture ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Add a thumbnail for a picture
   * @param {Object} thumbnail - The thumbnail data
   * @param {number} thumbnail.picture_id - The ID of the associated picture
   * @param {string} thumbnail.filename - The thumbnail filename
   * @param {number} thumbnail.width - The thumbnail width
   * @param {number} thumbnail.height - The thumbnail height
   * @returns {Promise<Object>} - The created thumbnail with ID
   */  async addThumbnail(thumbnail) {
    try {
      const result = await run(
        `INSERT INTO thumbnails (picture_id, filename, width, height)
         VALUES (?, ?, ?, ?)`,
        [
          thumbnail.picture_id,
          thumbnail.filename,
          thumbnail.width,
          thumbnail.height
        ]
      );
      
      logger.log('Thumbnail created:', { id: result.lastID, ...thumbnail });
      
      return {
        id: result.lastID,
        ...thumbnail
      };
    } catch (error) {
      logger.error('Error creating thumbnail:', error);
      throw error;
    }
  }
  
  /**
   * Get thumbnails for a picture
   * @param {number} pictureId - The picture ID
   * @returns {Promise<Array>} - Array of thumbnails
   */
  async getThumbnails(pictureId) {
    try {
      const thumbnails = await all(
        `SELECT id, filename, width, height, created_at
         FROM thumbnails
         WHERE picture_id = ?`,
        [pictureId]
      );
      
      logger.log('Thumbnails retrieved for picture:', { pictureId, thumbnails });
      
      return thumbnails;
    } catch (error) {
      logger.error(`Error getting thumbnails for picture ${pictureId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new PicturesDAO();
