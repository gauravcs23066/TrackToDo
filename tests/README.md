# TrackToDo Test Suite

Comprehensive test suite for the TrackToDo application covering unit tests, integration tests, and performance tests.

## Test Structure

```
tests/
├── backend/           # Backend API tests
│   └── task.test.js   # Task CRUD operations and API endpoints
├── frontend/          # Frontend component tests
│   └── components.test.js  # React component tests
├── integration/       # Integration tests
│   └── api.test.js    # End-to-end API workflow tests
├── performance/       # Performance and load tests
│   └── load.test.js   # Load testing and performance benchmarks
└── README.md         # This file
```

## Test Categories

### 1. Backend Tests (`tests/backend/`)
- **Task CRUD Operations**: Create, read, update, delete tasks
- **API Endpoints**: All REST API endpoints
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Proper error responses and status codes
- **Filtering & Sorting**: Task filtering and sorting functionality

### 2. Frontend Tests (`tests/frontend/`)
- **Component Rendering**: All React components render correctly
- **User Interactions**: Form submissions, button clicks, filtering
- **State Management**: Context API and state updates
- **Local Storage**: Data persistence in browser
- **Responsive Design**: Component behavior across screen sizes

### 3. Integration Tests (`tests/integration/`)
- **Complete Workflows**: End-to-end task lifecycle
- **Data Persistence**: Data consistency across operations
- **Concurrent Operations**: Multiple simultaneous requests
- **Filtering & Sorting**: Complex query operations
- **Statistics**: Accurate data aggregation

### 4. Performance Tests (`tests/performance/`)
- **Response Times**: API response time benchmarks
- **Concurrent Handling**: Multiple simultaneous requests
- **Large Datasets**: Performance with 100+ tasks
- **Memory Usage**: Memory leak detection
- **Rate Limiting**: API rate limiting behavior

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install test dependencies
npm install --save-dev jest supertest @testing-library/react @testing-library/jest-dom
```

### Backend Tests
```bash
# Run all backend tests
npm test tests/backend/

# Run specific test file
npm test tests/backend/task.test.js
```

### Frontend Tests
```bash
# Run all frontend tests
npm test tests/frontend/

# Run specific test file
npm test tests/frontend/components.test.js
```

### Integration Tests
```bash
# Run integration tests
npm test tests/integration/

# Run specific test file
npm test tests/integration/api.test.js
```

### Performance Tests
```bash
# Run performance tests
npm test tests/performance/

# Run specific test file
npm test tests/performance/load.test.js
```

### All Tests
```bash
# Run entire test suite
npm test
```

## Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### Test Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:backend": "jest tests/backend/",
    "test:frontend": "jest tests/frontend/",
    "test:integration": "jest tests/integration/",
    "test:performance": "jest tests/performance/"
  }
}
```

## Test Data Management

### Test Data Isolation
- Each test suite uses isolated test data
- Test data is automatically cleaned up after tests
- No interference between different test runs

### Mock Data
- Consistent test data across all test suites
- Realistic task data with various priorities and states
- Edge cases and boundary conditions covered

## Coverage Requirements

### Backend Coverage
- **API Endpoints**: 100% coverage
- **Data Models**: 100% coverage
- **Validation**: 100% coverage
- **Error Handling**: 100% coverage

### Frontend Coverage
- **Components**: 100% coverage
- **User Interactions**: 100% coverage
- **State Management**: 100% coverage
- **Error States**: 100% coverage

### Integration Coverage
- **Complete Workflows**: 100% coverage
- **Data Persistence**: 100% coverage
- **Error Scenarios**: 100% coverage

## Performance Benchmarks

### Response Time Requirements
- **Health Check**: < 100ms
- **GET Tasks**: < 50ms (empty), < 500ms (100 tasks)
- **POST Tasks**: < 200ms
- **PUT Tasks**: < 150ms
- **DELETE Tasks**: < 100ms

### Load Requirements
- **Concurrent Requests**: 10+ simultaneous requests
- **Large Datasets**: 100+ tasks without performance degradation
- **Memory Usage**: < 10MB increase during operations
- **Rate Limiting**: Proper handling of 100+ requests per minute

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Test Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Test Data
- Use consistent test data
- Clean up after each test
- Avoid test interdependencies

### 3. Assertions
- Use specific assertions
- Test both success and failure cases
- Verify response structure and content

### 4. Performance
- Set reasonable timeouts
- Test with realistic data volumes
- Monitor memory usage

## Debugging Tests

### Common Issues
1. **Test Data Conflicts**: Ensure proper cleanup
2. **Async Operations**: Use proper async/await patterns
3. **Mock Data**: Verify mock data matches expected format
4. **Environment**: Check test environment setup

### Debug Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with debug output
npm test -- --detectOpenHandles

# Run specific test with debug
npm test -- --testNamePattern="should create task"
```

## Contributing

### Adding New Tests
1. Follow existing test structure
2. Use descriptive test names
3. Include both positive and negative test cases
4. Update this README if adding new test categories

### Test Requirements
- All new features must include tests
- Tests must pass before merging
- Coverage must not decrease
- Performance benchmarks must be maintained
