console.log('Starting simple test...');

try {
  const picturesDao = require('./database/picturesDao');
  console.log('Successfully imported picturesDao');
  
  picturesDao.getAll().then(pictures => {
    console.log('Got pictures:', pictures.length);
    process.exit(0);
  }).catch(error => {
    console.error('Error getting pictures:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Error importing picturesDao:', error);
  process.exit(1);
}
