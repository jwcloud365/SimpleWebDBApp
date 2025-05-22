# Simple Picture Database Website

A modern, responsive web application for managing a personal picture database with user-friendly upload, viewing, editing, and deletion capabilities.

## Project Overview

This application provides a streamlined way to manage your picture collection with the following features:

- **Upload Management**: Upload pictures with descriptive text
- **Gallery View**: View all pictures as thumbnails with descriptions
- **Detail View**: See full-size pictures with description
- **Content Management**: Update descriptions and delete pictures
- **Quick Actions**: Perform deletions directly from gallery view

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
3. Run the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Development Status

This project is currently in development. See [tasks.md](tasks.md) for the current status and upcoming features.

## Architecture

See [planning.md](planning.md) for detailed information about the project architecture, constraints, and design principles.

## Future Plans

This application is designed to be deployable to Azure Web App service with EntraID authentication integration.

## License

[MIT](LICENSE)
