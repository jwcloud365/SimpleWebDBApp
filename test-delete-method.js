const picturesDao = require('./database/picturesDao');

async function testDelete() {
  try {
    console.log('Testing delete method...');
    
    // First, let's get all pictures to see what's available
    const allPictures = await picturesDao.getAll();
    console.log('All pictures:', allPictures);
    
    if (allPictures.length > 0) {
      const pictureId = allPictures[0].id;
      console.log(`Testing delete on picture ID: ${pictureId}`);
      
      const deleteResult = await picturesDao.delete(pictureId);
      console.log('Delete result:', deleteResult);
      console.log('Type of delete result:', typeof deleteResult);
      
      if (deleteResult === true) {
        console.log('Delete returned true - success!');
      } else if (deleteResult === false) {
        console.log('Delete returned false - picture not found or failed');
      } else {
        console.log('Delete returned unexpected value:', deleteResult);
      }
    } else {
      console.log('No pictures found to test delete');
    }
    
  } catch (error) {
    console.error('Delete test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

testDelete().then(() => {
  console.log('Delete test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
