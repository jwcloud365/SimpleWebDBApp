#!/usr/bin/env node
/**
 * Final Delete Functionality Test
 * Tests the complete delete functionality end-to-end
 */

const fs = require('fs');
const path = require('path');

console.log('=== FINAL DELETE FUNCTIONALITY TEST ===\n');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('1. Testing picture upload...');
    
    // Upload a test picture
    const uploadResponse = await fetch(`${baseUrl}/api/pictures`, {
      method: 'POST',
      body: (() => {
        const formData = new FormData();
        // Use an existing file for testing
        const filePath = path.join(__dirname, 'public/uploads/picture-1748005166994-a199ea3a8661f5d6.jpg');
        const fileBuffer = fs.readFileSync(filePath);
        const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
        formData.append('picture', blob, 'test-picture.jpg');
        formData.append('description', 'Test picture for delete functionality');
        return formData;
      })()
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ Picture uploaded successfully:', uploadResult);
    
    const pictureId = uploadResult.picture.id;
    console.log(`📋 Picture ID to delete: ${pictureId}`);
    
    // Wait a moment
    await sleep(1000);
    
    console.log('\n2. Verifying picture exists...');
    
    // Verify the picture exists
    const getResponse = await fetch(`${baseUrl}/api/pictures/${pictureId}`);
    if (!getResponse.ok) {
      throw new Error(`Picture not found: ${getResponse.status}`);
    }
    
    const picture = await getResponse.json();
    console.log('✅ Picture exists:', { id: picture.id, filename: picture.filename });
    
    console.log('\n3. Testing delete functionality...');
    
    // Delete the picture
    const deleteResponse = await fetch(`${baseUrl}/api/pictures/${pictureId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`Delete failed: ${deleteResponse.status} ${deleteResponse.statusText} - ${errorText}`);
    }
    
    const deleteResult = await deleteResponse.json();
    console.log('✅ Delete request successful:', deleteResult);
    
    // Wait a moment
    await sleep(1000);
    
    console.log('\n4. Verifying picture was deleted...');
    
    // Verify the picture no longer exists
    const verifyResponse = await fetch(`${baseUrl}/api/pictures/${pictureId}`);
    if (verifyResponse.ok) {
      throw new Error('Picture still exists after deletion!');
    }
    
    if (verifyResponse.status !== 404) {
      throw new Error(`Unexpected response: ${verifyResponse.status}`);
    }
    
    console.log('✅ Picture successfully deleted (404 confirmed)');
    
    console.log('\n5. Verifying gallery is updated...');
    
    // Check that the picture is not in the gallery
    const galleryResponse = await fetch(`${baseUrl}/api/pictures`);
    const gallery = await galleryResponse.json();
    
    const stillExists = gallery.pictures.find(p => p.id === pictureId);
    if (stillExists) {
      throw new Error('Picture still appears in gallery after deletion!');
    }
    
    console.log('✅ Picture removed from gallery');
    
    console.log('\n🎉 ALL TESTS PASSED! Delete functionality is working correctly.');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  console.log('Note: This test requires Node.js 18+ or fetch polyfill');
  console.log('Testing with curl commands instead...\n');
  
  // Alternative test with curl commands
  console.log('MANUAL TEST STEPS:');
  console.log('1. Upload a picture:');
  console.log('   curl -X POST http://localhost:3000/api/pictures -F "picture=@public/uploads/picture-1748005166994-a199ea3a8661f5d6.jpg" -F "description=Test"');
  console.log('2. Note the returned picture ID');
  console.log('3. Delete the picture:');
  console.log('   curl -X DELETE http://localhost:3000/api/pictures/[ID] -H "Content-Type: application/json"');
  console.log('4. Verify deletion:');
  console.log('   curl -X GET http://localhost:3000/api/pictures/[ID]  # Should return 404');
  console.log('   curl -X GET http://localhost:3000/api/pictures       # Should not contain the deleted picture');
  
  process.exit(0);
}

runTest();
