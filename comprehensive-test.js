const fs = require('fs');
const path = require('path');

// Create a comprehensive test that logs to a file
const logFile = path.join(__dirname, 'delete-test.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

log('=== DELETE FUNCTIONALITY COMPREHENSIVE TEST ===');

async function testDelete() {
  try {
    // Test 1: Upload a picture
    log('TEST 1: Uploading a test picture...');
    const uploadResponse = await fetch('http://localhost:3000/api/pictures', {
      method: 'POST',
      body: (() => {
        const formData = new FormData();
        // We'll need to create a simple test file
        const blob = new Blob(['test image content'], { type: 'image/jpeg' });
        formData.append('picture', blob, 'test.jpg');
        formData.append('description', 'Test picture for comprehensive delete test');
        return formData;
      })()
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }
    
    const uploadData = await uploadResponse.json();
    log(`Upload successful: Picture ID ${uploadData.picture.id}`);
    
    // Test 2: Verify picture exists
    log('TEST 2: Verifying picture exists...');
    const getResponse = await fetch(`http://localhost:3000/api/pictures/${uploadData.picture.id}`);
    if (getResponse.ok) {
      log('Picture exists in database');
    } else {
      throw new Error('Picture not found after upload');
    }
    
    // Test 3: Delete the picture
    log('TEST 3: Deleting the picture...');
    const deleteResponse = await fetch(`http://localhost:3000/api/pictures/${uploadData.picture.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    log(`Delete response status: ${deleteResponse.status}`);
    const deleteData = await deleteResponse.json();
    log(`Delete response data: ${JSON.stringify(deleteData)}`);
    
    // Test 4: Verify picture is gone
    log('TEST 4: Verifying picture was deleted...');
    const verifyResponse = await fetch(`http://localhost:3000/api/pictures/${uploadData.picture.id}`);
    log(`Verification response status: ${verifyResponse.status}`);
    
    if (verifyResponse.status === 404) {
      log('SUCCESS: Picture was actually deleted from database');
    } else {
      log('FAILURE: Picture still exists in database');
    }
    
    // Test 5: Check if this is a response formatting issue
    if (deleteResponse.status === 500 && verifyResponse.status === 404) {
      log('CONCLUSION: Delete operation succeeds but API returns error response');
      log('This indicates an issue with the delete route response logic');
    }
    
  } catch (error) {
    log(`Test failed with error: ${error.message}`);
  }
}

// We can't use fetch in Node.js easily, so let's use curl instead
log('Using curl for testing...');
process.exit(0);
