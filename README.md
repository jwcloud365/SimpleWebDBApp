# Simple Picture Database Website

A modern, responsive web application for managing a personal picture database with user-friendly upload, viewing, editing, and deletion capabilities.

## Project Overview

This application provides a streamlined way to manage your picture collection with the following features:

- **Upload Management**: Upload pictures with descriptive text
- **Gallery View**: View all pictures as thumbnails with descriptions
- **Detail View**: See full-size pictures with description
- **Content Management**: Update descriptions and delete pictures
- **Quick Actions**: Perform deletions directly from gallery view
- **Responsive Design**: Optimized for desktop and mobile devices
- **Database Backup**: Create and restore database backups

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Frontend**: HTML, CSS, JavaScript (Vanilla ES6+)
- **File Handling**: Multer
- **View Engine**: EJS
- **Styling**: CSS3 with Custom Properties

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone this repository
   ```
   git clone https://github.com/jwcloud365/SimpleWebDBApp.git
   cd SimpleWebDBApp
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Initialize the database:
   ```
   npm run db:init
   ```

4. (Optional) Seed the database with test data:
   ```
   npm run db:seed
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Database Management

The application includes utilities for backing up and restoring the SQLite database:

```javascript
// Example usage in Node.js scripts
const backupUtils = require('./database/backup');

// Create a backup
async function createBackup() {
  const backupPath = await backupUtils.createBackup('my-backup');
  console.log(`Backup created at: ${backupPath}`);
}

// List all backups
async function listBackups() {
  const backups = await backupUtils.listBackups();
  console.log('Available backups:', backups);
}

// Restore from a backup
async function restoreDatabase(backupPath) {
  await backupUtils.restoreFromBackup(backupPath);
  console.log('Database restored successfully');
}
```

### Database Backup CLI

For ease of use, a command-line utility script is included:

```bash
# Create a backup
npm run db:backup

# Create a backup with a custom name
node scripts/backup-db.js create monthly-backup

# List all available backups
npm run db:backup:list

# Restore from a backup
node scripts/backup-db.js restore ./database/backups/backup-2023-01-01.sqlite

# Verify a backup file
node scripts/backup-db.js verify ./database/backups/backup-2023-01-01.sqlite

# Show help information
node scripts/backup-db.js help
```

## Testing

Run the test suite:

```
npm test
```

To run tests with coverage report:

```
npm run test:coverage
```

To run end-to-end tests only:

```
npm run test:e2e
```

See [testing documentation](./docs/testing.md) for more details on the testing approach and test types.

## Development Status

This project is currently in development. See [tasks.md](tasks.md) for the current status and upcoming features.

## Architecture

See [planning.md](planning.md) for detailed information about the project architecture, constraints, and design principles.

## Future Plans

This application is designed to be deployable to Azure Web App service with EntraID authentication integration.

## License

[MIT](LICENSE)
