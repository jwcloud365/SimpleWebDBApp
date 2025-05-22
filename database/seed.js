/**
 * Database seeding script for Simple Picture Database
 * Populates the database with sample data for testing and development
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { run, transaction } = require('./utils');
const { closeDatabase } = require('./connection');

// Sample picture data
const samplePictures = [
  {
    filename: 'sample1.jpg',
    original_filename: 'mountain_landscape.jpg',
    description: 'Beautiful mountain landscape with snow-capped peaks',
    mimetype: 'image/jpeg',
    size: 1024000
  },
  {
    filename: 'sample2.jpg',
    original_filename: 'beach_sunset.jpg',
    description: 'Colorful sunset over a tropical beach',
    mimetype: 'image/jpeg',
    size: 856000
  },
  {
    filename: 'sample3.png',
    original_filename: 'forest_path.png',
    description: 'A serene path through a dense forest',
    mimetype: 'image/png',
    size: 1458000
  }
];

// Sample thumbnail data (will be linked to the pictures above)
const sampleThumbnails = [
  {
    picture_index: 0, // Links to the first picture
    filename: 'thumb_sample1.jpg',
    width: 200,
    height: 150
  },
  {
    picture_index: 1, // Links to the second picture
    filename: 'thumb_sample2.jpg',
    width: 200,
    height: 150
  },
  {
    picture_index: 2, // Links to the third picture
    filename: 'thumb_sample3.jpg',
    width: 200,
    height: 150
  }
];

/**
 * Seed the database with sample data
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // First clear existing data
    await run('DELETE FROM thumbnails');
    await run('DELETE FROM pictures');
    console.log('Existing data cleared');
    
    // Seed data using a transaction to ensure all or nothing
    await transaction(async (txn) => {
      console.log('Inserting sample pictures...');
      
      // Insert pictures and store their IDs
      const pictureIds = [];
      for (const picture of samplePictures) {
        const result = await txn.run(
          `INSERT INTO pictures (filename, original_filename, description, mimetype, size)
           VALUES (?, ?, ?, ?, ?)`,
          [picture.filename, picture.original_filename, picture.description, picture.mimetype, picture.size]
        );
        pictureIds.push(result.lastID);
      }
      
      console.log('Inserting sample thumbnails...');
      
      // Insert thumbnails linked to the pictures
      for (const thumbnail of sampleThumbnails) {
        await txn.run(
          `INSERT INTO thumbnails (picture_id, filename, width, height)
           VALUES (?, ?, ?, ?)`,
          [pictureIds[thumbnail.picture_index], thumbnail.filename, thumbnail.width, thumbnail.height]
        );
      }
    });
    
    console.log('Database seeding completed successfully');
    
    // Copy sample images to uploads directory if needed
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // In a real application, you would copy sample images here
    // For this demo, we'll just create empty placeholder files
    samplePictures.forEach(picture => {
      const filePath = path.join(uploadsDir, picture.filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'Sample image placeholder');
        console.log(`Created placeholder file: ${picture.filename}`);
      }
    });
    
    sampleThumbnails.forEach(thumbnail => {
      const filePath = path.join(uploadsDir, thumbnail.filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'Sample thumbnail placeholder');
        console.log(`Created placeholder file: ${thumbnail.filename}`);
      }
    });
    
    console.log('Sample image placeholders created');
    
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Execute seeding if this script is run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
