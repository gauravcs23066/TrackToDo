# TrackToDo Backend API

A RESTful API for the TrackToDo application built with Node.js and Express.

## Features

- ✅ CRUD operations for tasks
- ✅ Priority-based task management
- ✅ Task completion tracking
- ✅ Statistics and analytics
- ✅ Input validation and sanitization
- ✅ Rate limiting and security
- ✅ JSON file-based storage
- ✅ CORS support
- ✅ Error handling

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering and sorting)
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion

### Statistics
- `GET /api/stats` - Get task statistics

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## API Usage Examples

### Create a Task
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "priority": "high"
  }'
```

### Get All Tasks
```bash
curl http://localhost:3001/api/tasks
```

### Filter Tasks
```bash
# Get completed tasks
curl http://localhost:3001/api/tasks?filter=completed

# Get high priority tasks
curl http://localhost:3001/api/tasks?filter=high

# Sort by priority
curl http://localhost:3001/api/tasks?sort=priority
```

### Update Task
```bash
curl -X PUT http://localhost:3001/api/tasks/123 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task title",
    "completed": true
  }'
```

### Toggle Task Completion
```bash
curl -X PATCH http://localhost:3001/api/tasks/123/toggle
```

### Get Statistics
```bash
curl http://localhost:3001/api/stats
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Data Model

### Task Object
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "priority": "high|medium|low",
  "completed": boolean,
  "createdAt": "ISO 8601 date",
  "updatedAt": "ISO 8601 date"
}
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive data validation
- **Input Sanitization**: Clean and trim inputs

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server errors

## Development

```bash
# Run tests
npm test

# Start with nodemon (auto-restart)
npm run dev
```

## License

MIT License - see LICENSE file for details.
