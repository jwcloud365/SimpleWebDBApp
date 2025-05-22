/**
 * Database utility functions for Simple Picture Database
 * Provides common database operations and error handling
 */

const { getDatabase } = require('./connection');

/**
 * Run a query that doesn't return any rows (INSERT, UPDATE, DELETE)
 * @param {string} sql - The SQL query to execute
 * @param {Array} params - The parameters for the query
 * @returns {Promise<Object>} - A promise that resolves with the result
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Database error in run operation:', err.message);
        console.error('SQL:', sql);
        console.error('Params:', params);
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Get a single row from the database
 * @param {string} sql - The SQL query to execute
 * @param {Array} params - The parameters for the query
 * @returns {Promise<Object|null>} - A promise that resolves with the row or null if not found
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Database error in get operation:', err.message);
        console.error('SQL:', sql);
        console.error('Params:', params);
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

/**
 * Get multiple rows from the database
 * @param {string} sql - The SQL query to execute
 * @param {Array} params - The parameters for the query
 * @returns {Promise<Array>} - A promise that resolves with the rows
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Database error in all operation:', err.message);
        console.error('SQL:', sql);
        console.error('Params:', params);
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

/**
 * Execute multiple statements in a transaction
 * @param {Function} callback - A function that receives a transaction object
 * @returns {Promise<void>} - A promise that resolves when the transaction is complete
 */
function transaction(callback) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      try {
        // Create a transaction object with run, get, and all methods
        const txn = {
          run: (sql, params = []) => {
            return new Promise((innerResolve, innerReject) => {
              db.run(sql, params, function(err) {
                if (err) innerReject(err);
                else innerResolve({ lastID: this.lastID, changes: this.changes });
              });
            });
          },
          get: (sql, params = []) => {
            return new Promise((innerResolve, innerReject) => {
              db.get(sql, params, (err, row) => {
                if (err) innerReject(err);
                else innerResolve(row || null);
              });
            });
          },
          all: (sql, params = []) => {
            return new Promise((innerResolve, innerReject) => {
              db.all(sql, params, (err, rows) => {
                if (err) innerReject(err);
                else innerResolve(rows || []);
              });
            });
          }
        };
        
        // Execute the callback with the transaction object
        callback(txn)
          .then(() => {
            db.run('COMMIT', (err) => {
              if (err) {
                console.error('Error committing transaction:', err.message);
                reject(err);
                return;
              }
              resolve();
            });
          })
          .catch((err) => {
            console.error('Error in transaction, rolling back:', err.message);
            db.run('ROLLBACK', (rollbackErr) => {
              if (rollbackErr) {
                console.error('Error rolling back transaction:', rollbackErr.message);
              }
              reject(err);
            });
          });
      } catch (err) {
        console.error('Error setting up transaction:', err.message);
        db.run('ROLLBACK', (rollbackErr) => {
          if (rollbackErr) {
            console.error('Error rolling back transaction:', rollbackErr.message);
          }
          reject(err);
        });
      }
    });
  });
}

module.exports = {
  run,
  get,
  all,
  transaction
};
