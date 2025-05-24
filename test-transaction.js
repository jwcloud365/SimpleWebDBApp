const { transaction } = require('./database/utils');

console.log('Starting transaction test...');

async function testTransaction() {
  try {
    console.log('Testing transaction function...');
    
    const result = await transaction(async (txn) => {
      console.log('Inside transaction callback');
      // Just return a test value
      return 'test-success';
    });
    
    console.log('Transaction result:', result);
    console.log('Type of result:', typeof result);
    console.log('Test passed! Transaction returns the callback result correctly.');
  } catch (error) {
    console.error('Transaction test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

testTransaction().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
