# Simple Picture Database - Testing Documentation

This document outlines the testing approach, test types, and instructions for running tests in the Simple Picture Database application.

## Testing Approach

The application uses a comprehensive testing strategy that includes:

1. **Unit Tests**: Tests for individual components in isolation
2. **Integration Tests**: Tests for interactions between components
3. **End-to-End Tests**: Tests for complete application workflows

## Test Types

### Unit Tests

Unit tests focus on testing individual functions and classes in isolation. They are organized by module and target specific functionality:

- **Database Tests**: Tests for database connection, DAO methods, and utilities
- **Middleware Tests**: Tests for middleware components like file upload handling
- **Route Handler Tests**: Tests for API endpoint handlers

### Integration Tests

Integration tests verify the interaction between different components:

- **API Integration Tests**: Tests for API endpoints that integrate with the database
- **File Processing Tests**: Tests for file upload and processing workflows

### End-to-End Tests

End-to-end tests simulate user interactions with the complete application:

- **User Flow Tests**: Tests for complete user workflows like uploading, viewing, and deleting pictures
- **Frontend Tests**: Tests for frontend page rendering and interactions

## Test Structure

Tests are organized in a directory structure that mirrors the application structure:

```
tests/
├── database/              # Database tests
│   ├── connection.test.js
│   ├── picturesDao.test.js
│   └── backup.test.js
├── middleware/            # Middleware tests
│   └── fileUpload.test.js
├── routes/                # Route handler tests
│   └── pictures.test.js
├── e2e/                   # End-to-end tests
│   └── app.test.js
├── fixtures/              # Test fixtures
│   └── test-image.jpg
└── helpers/               # Test helper utilities
    └── db-helper.js
```

## Running Tests

### Prerequisites

- Node.js (v18+)
- npm

### Commands

The following npm scripts are available for running tests:

- **Run all tests in watch mode**:
  ```
  npm test
  ```

- **Run tests with coverage report**:
  ```
  npm run test:coverage
  ```

- **Run end-to-end tests only**:
  ```
  npm run test:e2e
  ```

### Test Coverage

The application aims for at least 80% code coverage across all modules. The coverage report can be generated using:

```
npm run test:coverage
```

The coverage report will be available in the `coverage/` directory.

## Continuous Integration

The application is set up for continuous integration with automated test runs on each commit. The CI pipeline includes:

1. **Code linting**: Ensure code style consistency
2. **Unit tests**: Run all unit tests
3. **Integration tests**: Run all integration tests
4. **End-to-end tests**: Run all end-to-end tests
5. **Coverage report**: Generate and publish coverage report

## Adding New Tests

When adding new features or modifying existing ones, follow these guidelines for adding tests:

1. **Create a test file** in the appropriate directory
2. **Write tests** that cover the main functionality and edge cases
3. **Run tests locally** to ensure they pass
4. **Check coverage** to ensure adequate test coverage

Example test structure:

```javascript
describe('Feature Name', () => {
  // Setup before tests
  beforeAll(() => {
    // Setup code
  });
  
  // Cleanup after tests
  afterAll(() => {
    // Cleanup code
  });
  
  // Individual test cases
  test('should do something specific', () => {
    // Test code
    expect(result).toBe(expectedValue);
  });
  
  // Test edge cases
  test('should handle edge case', () => {
    // Test code for edge case
    expect(result).toBe(expectedValue);
  });
  
  // Test error scenarios
  test('should handle errors gracefully', () => {
    // Test code for error scenario
    expect(() => functionThatThrows()).toThrow();
  });
});
```

## Troubleshooting Tests

If you encounter issues with tests:

1. **Check test logs** for error messages
2. **Verify test environment** is properly set up
3. **Ensure database** is initialized correctly
4. **Check for conflicts** between test files
5. **Run specific tests** to isolate the issue:
   ```
   npx jest path/to/test.js
   ```

## Database Testing

For tests that involve the database:

1. **Use the test database**: Tests should use a separate test database
2. **Reset database state**: Clean up after tests to ensure isolation
3. **Mock database calls** for unit tests
4. **Use transactions** for integration tests when possible
