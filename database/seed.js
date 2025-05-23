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
    filename: 'sample1.svg',
    original_filename: 'mountain_landscape.jpg',
    description: 'Beautiful mountain landscape with snow-capped peaks',
    mimetype: 'image/svg+xml',
    size: 1024000
  },
  {
    filename: 'sample2.svg',
    original_filename: 'beach_sunset.jpg',
    description: 'Colorful sunset over a tropical beach',
    mimetype: 'image/svg+xml',
    size: 856000
  },
  {
    filename: 'sample3.svg',
    original_filename: 'forest_path.png',
    description: 'A serene path through a dense forest',
    mimetype: 'image/svg+xml',
    size: 1458000
  }
];

// Sample thumbnail data (will be linked to the pictures above)
const sampleThumbnails = [
  {
    picture_index: 0, // Links to the first picture
    filename: 'thumb-sample1.svg',
    width: 200,
    height: 150
  },
  {
    picture_index: 1, // Links to the second picture
    filename: 'thumb-sample2.svg',
    width: 200,
    height: 150
  },
  {
    picture_index: 2, // Links to the third picture
    filename: 'thumb-sample3.svg',
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
    const uploadsDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }    // Create colorful image placeholders instead of empty files
    samplePictures.forEach(picture => {
      const filePath = path.join(uploadsDir, picture.filename);
      if (!fs.existsSync(filePath)) {
        // Create a simple SVG with a colored background and the filename as text
        const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="${getRandomColor()}" />
  <text x="400" y="300" font-family="Arial" font-size="32" fill="white" text-anchor="middle">${picture.description}</text>
  <text x="400" y="350" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${picture.original_filename}</text>
</svg>`;
        fs.writeFileSync(filePath, svgContent);
        console.log(`Created SVG placeholder for: ${picture.filename}`);
      }
    });
    
    sampleThumbnails.forEach(thumbnail => {
      const filePath = path.join(uploadsDir, thumbnail.filename);
      if (!fs.existsSync(filePath)) {
        // Create a simple SVG thumbnail that matches the naming pattern
        const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
  <rect width="200" height="150" fill="${getRandomColor()}" />
  <text x="100" y="75" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Thumbnail</text>
</svg>`;
        fs.writeFileSync(filePath, svgContent);
        console.log(`Created SVG thumbnail placeholder: ${thumbnail.filename}`);
      }
    });
    
    // Helper function to generate random colors for our SVG images
    function getRandomColor() {
      const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#16a085', '#d35400', '#2c3e50'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
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
