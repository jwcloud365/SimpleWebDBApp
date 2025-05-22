# Simple Picture Database Website - Project Planning

## High-Level Vision

A modern, responsive web application for managing a personal picture database with user-friendly upload, viewing, editing, and deletion capabilities. The application will start as a local development solution and evolve into a cloud-deployed service with enterprise authentication.

## Core Functionality

- **Upload Management**: Users can upload pictures with descriptive text
- **Gallery View**: Display all pictures as thumbnails with descriptions in a responsive grid
- **Detail View**: Full-size picture display with description and editing capabilities
- **Content Management**: Update picture descriptions and delete pictures
- **Quick Actions**: Delete functionality directly from gallery view

## Architecture Overview

### Application Layers
1. **Frontend Layer**: Modern, responsive web interface
2. **Backend Layer**: RESTful API built with Node.js and Express
3. **Data Layer**: SQLite database for local development and Azure deployment
4. **Authentication Layer**: Prepared for Azure EntraID integration

### Design Principles
- **Mobile-First**: Responsive design optimized for various screen sizes
- **Customizable**: Easy theme and color scheme modifications
- **Scalable**: Architecture ready for cloud deployment
- **Secure**: Authentication-ready foundation

## Technical Architecture

### Backend Architecture
```
Client Request → Express Router → Controller → Service Layer → Data Access Layer → SQLite
```

### Database Schema
```sql
Pictures Table:
- id (PRIMARY KEY, INTEGER, AUTOINCREMENT)
- filename (TEXT, NOT NULL)
- original_name (TEXT, NOT NULL)
- description (TEXT)
- file_size (INTEGER)
- mime_type (TEXT)
- upload_date (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- updated_date (DATETIME)
```

### File Structure
```
SimpleWebDBApp/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── config/
│   └── utils/
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/
├── views/
├── database/
├── tests/
└── docs/
```

## Technology Stack

### Core Technologies
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: SQLite3
- **View Engine**: EJS (for server-side rendering)
- **File Handling**: Multer (for file uploads)

### Frontend Technologies
- **Styling**: CSS3 with CSS Custom Properties (CSS variables)
- **JavaScript**: Vanilla ES6+ with modern features
- **Responsive Framework**: CSS Grid and Flexbox
- **Icons**: Font Awesome or similar icon library

### Development Tools
- **Package Manager**: npm
- **Process Manager**: PM2 (for production)
- **Development**: Nodemon (for auto-restart)
- **Database Management**: Better-SQLite3 or SQLite3 npm package

### Azure Deployment Stack
- **Hosting**: Azure App Service (Web App)
- **Authentication**: Azure EntraID (Azure AD)
- **Database**: SQLite (embedded with deployment)
- **File Storage**: Local file system (within app service)

## Constraints and Considerations

### Technical Constraints
- SQLite database limitations for concurrent users
- File storage within application directory
- Local development on Windows 11
- Preparation for Azure cloud deployment

### Design Constraints
- Must be responsive across devices (mobile, tablet, desktop)
- Customizable color scheme and buttons
- Modern, attractive UI design
- Fast loading times for image galleries

### Security Considerations
- File upload validation (type, size limits)
- SQL injection prevention
- XSS protection
- CSRF token implementation
- Prepared for Azure EntraID authentication

## Deployment Strategy

### Phase 1: Local Development
- Windows 11 local environment
- SQLite database file in project directory
- Local file uploads in public/uploads directory
- Development server on localhost

### Phase 2: Azure Deployment
- Azure App Service Web App
- SQLite database deployed with application
- Azure EntraID authentication integration
- Environment-specific configuration

## Customization Framework

### Theme System
- CSS custom properties for colors, fonts, spacing
- Modular CSS architecture
- Easy theme switching capability
- Dark/light mode support preparation

### Configuration
- Environment-based settings (development/production)
- Configurable upload limits and file types
- Database connection settings
- Authentication provider settings

## Performance Considerations

- Image thumbnail generation and caching
- Efficient database queries with proper indexing
- Lazy loading for large image galleries
- Optimized file upload handling
- Responsive image serving

## Future Enhancements (Post-MVP)

- Image resizing and optimization
- Advanced search and filtering capabilities
- Bulk upload functionality
- Image tagging system
- Export functionality
- Advanced user management
- API rate limiting
- Comprehensive logging and monitoring

## Success Criteria

- Functional local development environment
- Responsive design across all major device types
- Successful Azure deployment capability
- Clean, maintainable codebase
- Comprehensive documentation
- Ready for EntraID authentication integration