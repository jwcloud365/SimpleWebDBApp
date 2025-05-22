/**
 * Pictures Data Access Object (DAO)
 * Provides methods to interact with the pictures table in the database
 */

const { run, get, all, transaction } = require('./utils');
const path = require('path');
const fs = require('fs/promises');

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
      
      return {
        id: result.lastID,
        ...picture
      };
    } catch (error) {
      console.error('Error creating picture:', error.message);
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
      return await get(
        `SELECT id, filename, original_filename, description, mimetype, size, 
                created_at, updated_at
         FROM pictures
         WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error(`Error getting picture with ID ${id}:`, error.message);
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
      console.error('Error getting pictures:', error.message);
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
      const result = await run(
        `UPDATE pictures
         SET description = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [description, id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error(`Error updating picture ${id}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Delete a picture and its associated thumbnails
   * @param {number} id - The picture ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async delete(id) {
    try {
      // Use a transaction to ensure both database and files are deleted
      return await transaction(async (txn) => {
        // Get picture and thumbnail details before deletion
        const picture = await txn.get(
          'SELECT filename FROM pictures WHERE id = ?',
          [id]
        );
        
        if (!picture) {
          return false;
        }
        
        const thumbnails = await txn.all(
          'SELECT filename FROM thumbnails WHERE picture_id = ?',
          [id]
        );
        
        // Delete from database (thumbnails will be deleted via foreign key cascade)
        const result = await txn.run(
          'DELETE FROM pictures WHERE id = ?',
          [id]
        );
        
        if (result.changes === 0) {
          return false;
        }
        
        // Delete the actual files (in a real app, these operations would be made more robust)
        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        
        // Delete picture file
        try {
          await fs.unlink(path.join(uploadsDir, picture.filename));
        } catch (fileError) {
          console.warn(`Could not delete picture file ${picture.filename}:`, fileError.message);
          // Continue with other deletions
        }
        
        // Delete thumbnail files
        for (const thumbnail of thumbnails) {
          try {
            await fs.unlink(path.join(uploadsDir, thumbnail.filename));
          } catch (fileError) {
            console.warn(`Could not delete thumbnail file ${thumbnail.filename}:`, fileError.message);
            // Continue with other deletions
          }
        }
        
        return true;
      });
    } catch (error) {
      console.error(`Error deleting picture ${id}:`, error.message);
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
      
      return {
        id: result.lastID,
        ...thumbnail
      };
    } catch (error) {
      console.error('Error creating thumbnail:', error.message);
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
      return await all(
        `SELECT id, filename, width, height, created_at
         FROM thumbnails
         WHERE picture_id = ?`,
        [pictureId]
      );
    } catch (error) {
      console.error(`Error getting thumbnails for picture ${pictureId}:`, error.message);
      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new PicturesDAO();
