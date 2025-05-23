/**
 * Utility script to fix thumbnail naming inconsistencies
 * This script renames any thumbnails using the old convention (thumb_) to the new one (thumb-)
 * and updates the database accordingly
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { get, run, all, closeDatabase } = require('./database/utils');

async function fixThumbnails() {
  console.log('Starting thumbnail fix script...');
  
  try {
    // Get the uploads directory
    const uploadsDir = path.join(__dirname, 'public/uploads');
    
    // Read all files in the uploads directory
    const files = fs.readdirSync(uploadsDir);
    
    // Find files with the old thumbnail naming convention
    const oldThumbnails = files.filter(file => file.startsWith('thumb_'));
    
    if (oldThumbnails.length === 0) {
      console.log('No thumbnails with old naming convention found.');
    } else {
      console.log(`Found ${oldThumbnails.length} thumbnails with old naming convention. Fixing...`);
      
      // For each old thumbnail, rename it and update the database
      for (const oldThumb of oldThumbnails) {
        const newThumb = oldThumb.replace('thumb_', 'thumb-');
        const oldPath = path.join(uploadsDir, oldThumb);
        const newPath = path.join(uploadsDir, newThumb);
        
        // Check if we already have a file with the new name
        if (fs.existsSync(newPath)) {
          console.log(`File ${newThumb} already exists. Skipping ${oldThumb}.`);
          continue;
        }
        
        try {
          // Rename the file
          fs.renameSync(oldPath, newPath);
          console.log(`Renamed ${oldThumb} to ${newThumb}`);
          
          // Update the database
          const result = await run(
            'UPDATE thumbnails SET filename = ? WHERE filename = ?',
            [newThumb, oldThumb]
          );
          
          console.log(`Updated ${result.changes} database records for ${oldThumb}`);
        } catch (error) {
          console.error(`Error fixing ${oldThumb}:`, error.message);
        }
      }
    }
    
    // Now let's check that all thumbnails in the database have corresponding files
    const thumbnails = await all('SELECT id, filename FROM thumbnails');
    
    let missingFiles = 0;
    for (const thumb of thumbnails) {
      const thumbPath = path.join(uploadsDir, thumb.filename);
      if (!fs.existsSync(thumbPath)) {
        console.warn(`Warning: Thumbnail file ${thumb.filename} (ID: ${thumb.id}) not found on disk.`);
        missingFiles++;
      }
    }
    
    if (missingFiles > 0) {
      console.log(`Found ${missingFiles} thumbnail records with missing files.`);
    } else {
      console.log('All thumbnail records have corresponding files.');
    }
    
    // Check that all pictures in the database have corresponding files
    const pictures = await all('SELECT id, filename FROM pictures');
    
    missingFiles = 0;
    for (const pic of pictures) {
      const picPath = path.join(uploadsDir, pic.filename);
      if (!fs.existsSync(picPath)) {
        console.warn(`Warning: Picture file ${pic.filename} (ID: ${pic.id}) not found on disk.`);
        missingFiles++;
      }
    }
    
    if (missingFiles > 0) {
      console.log(`Found ${missingFiles} picture records with missing files.`);
    } else {
      console.log('All picture records have corresponding files.');
    }
    
    console.log('Thumbnail fix script completed.');
  } catch (error) {
    console.error('Error during thumbnail fix:', error);
  } finally {
    await closeDatabase();
  }
}

// Execute if run directly
if (require.main === module) {
  console.log('Starting fix-thumbnails.js script...');
  fixThumbnails()
    .then(() => console.log('Script completed successfully.'))
    .catch(err => console.error('Script failed:', err));
}

module.exports = fixThumbnails;
