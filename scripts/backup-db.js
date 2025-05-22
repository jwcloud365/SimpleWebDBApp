/**
 * Database Backup Script
 * 
 * This script automates the process of creating database backups.
 * It can be run manually or scheduled using a task scheduler.
 * 
 * Usage:
 * - Create a backup: node scripts/backup-db.js create
 * - List backups: node scripts/backup-db.js list
 * - Restore from backup: node scripts/backup-db.js restore [backup-path]
 */

const path = require('path');
const backupUtils = require('../database/backup');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

/**
 * Print help information
 */
function printHelp() {
  console.log('Database Backup Script');
  console.log('=====================');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/backup-db.js [command] [options]');
  console.log('');
  console.log('Commands:');
  console.log('  create [name]    Create a new backup (optional custom name)');
  console.log('  list             List all available backups');
  console.log('  restore [path]   Restore database from a backup file');
  console.log('  verify [path]    Verify a backup file is valid');
  console.log('  help             Show this help information');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/backup-db.js create monthly-backup');
  console.log('  node scripts/backup-db.js list');
  console.log('  node scripts/backup-db.js restore ./database/backups/backup-2023-01-01.sqlite');
}

/**
 * Create a new database backup
 */
async function createBackup() {
  try {
    const backupName = args[1] || '';
    console.log(`Creating database backup${backupName ? ` with name "${backupName}"` : ''}...`);
    
    const backupPath = await backupUtils.createBackup(backupName);
    console.log(`Backup created successfully: ${path.basename(backupPath)}`);
    console.log(`Location: ${backupPath}`);
  } catch (error) {
    console.error('Error creating backup:', error.message);
    process.exit(1);
  }
}

/**
 * List all available backups
 */
async function listBackups() {
  try {
    console.log('Listing available backups...');
    
    const backups = await backupUtils.listBackups();
    
    if (backups.length === 0) {
      console.log('No backups found.');
      return;
    }
    
    console.log(`Found ${backups.length} backup(s):`);
    console.log('');
    console.log('NAME                             SIZE      DATE');
    console.log('----------------------------------------------');
    
    backups.forEach(backup => {
      const size = (backup.size / 1024).toFixed(2) + ' KB';
      const date = backup.created.toLocaleString();
      console.log(`${backup.name.padEnd(32)} ${size.padEnd(10)} ${date}`);
    });
    
    console.log('');
    console.log(`Backup location: ${backupUtils.BACKUP_DIR}`);
  } catch (error) {
    console.error('Error listing backups:', error.message);
    process.exit(1);
  }
}

/**
 * Restore database from a backup file
 */
async function restoreFromBackup() {
  try {
    const backupPath = args[1];
    
    if (!backupPath) {
      console.error('Error: Backup path is required for restore operation.');
      console.log('Usage: node scripts/backup-db.js restore [backup-path]');
      process.exit(1);
    }
    
    console.log(`Verifying backup file: ${backupPath}`);
    const verification = await backupUtils.verifyBackup(backupPath);
    
    if (!verification.isValid) {
      console.error(`Error: Invalid backup file - ${verification.error}`);
      process.exit(1);
    }
    
    console.log('Backup verification successful:');
    console.log(`- File size: ${(verification.size / 1024).toFixed(2)} KB`);
    console.log(`- Created: ${verification.created.toLocaleString()}`);
    console.log('- Tables:');
    verification.tables.forEach(table => {
      console.log(`  - ${table.table}: ${table.records} records`);
    });
    
    console.log('');
    console.log('WARNING: This will overwrite the current database.');
    console.log('A backup of the current state will be created before restoring.');
    console.log('');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Do you want to continue? (y/N): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log('Restoring database...');
        await backupUtils.restoreFromBackup(backupPath);
        console.log('Database restored successfully.');
      } else {
        console.log('Restore operation cancelled.');
      }
      
      readline.close();
    });
  } catch (error) {
    console.error('Error restoring database:', error.message);
    process.exit(1);
  }
}

/**
 * Verify a backup file
 */
async function verifyBackup() {
  try {
    const backupPath = args[1];
    
    if (!backupPath) {
      console.error('Error: Backup path is required for verify operation.');
      console.log('Usage: node scripts/backup-db.js verify [backup-path]');
      process.exit(1);
    }
    
    console.log(`Verifying backup file: ${backupPath}`);
    const verification = await backupUtils.verifyBackup(backupPath);
    
    if (!verification.isValid) {
      console.error(`Error: Invalid backup file - ${verification.error}`);
      process.exit(1);
    }
    
    console.log('Backup verification successful:');
    console.log(`- File size: ${(verification.size / 1024).toFixed(2)} KB`);
    console.log(`- Created: ${verification.created.toLocaleString()}`);
    console.log('- Tables:');
    verification.tables.forEach(table => {
      console.log(`  - ${table.table}: ${table.records} records`);
    });
  } catch (error) {
    console.error('Error verifying backup:', error.message);
    process.exit(1);
  }
}

// Execute the appropriate command
switch (command) {
  case 'create':
    createBackup();
    break;
    
  case 'list':
    listBackups();
    break;
    
  case 'restore':
    restoreFromBackup();
    break;
    
  case 'verify':
    verifyBackup();
    break;
    
  case 'help':
  default:
    printHelp();
    break;
}
