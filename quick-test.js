// Simple test to check delete return value
const path = require('path');
const fs = require('fs').promises;

// Mock the logger to avoid issues
global.console = {
  log: (...args) => process.stdout.write(args.join(' ') + '\n'),
  error: (...args) => process.stderr.write('ERROR: ' + args.join(' ') + '\n'),
  warn: (...args) => process.stderr.write('WARN: ' + args.join(' ') + '\n')
};

const { transaction } = require('./database/utils');

async function quickDeleteTest() {
  console.log('Testing transaction return value for delete...');
  
  try {
    // Simulate what happens in the delete method
    const result = await transaction(async (txn) => {
      console.log('Inside transaction - checking if picture exists...');
      
      // Check if a picture exists (any picture)
      const picture = await txn.get('SELECT id, filename FROM pictures LIMIT 1');
      
      if (!picture) {
        console.log('No pictures found');
        return false;
      }
      
      console.log('Found picture:', picture.id);
      
      // Simulate the delete operation (but don't actually delete)
      // const dbResult = await txn.run('DELETE FROM pictures WHERE id = ?', [picture.id]);
      console.log('Would delete picture, returning true');
      
      return true;
    });
    
    console.log('Transaction returned:', result);
    console.log('Type:', typeof result);
    console.log('Boolean evaluation: !result =', !result);
    
    if (!result) {
      console.log('This would cause the API to return error');
    } else {
      console.log('This would cause the API to return success');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  
  process.exit(0);
}

quickDeleteTest();
