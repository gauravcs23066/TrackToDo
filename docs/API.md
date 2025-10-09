# TrackToDo API Documentation

## Overview

The TrackToDo API is a RESTful web service built with Node.js and Express that provides endpoints for managing tasks in a to-do application. The API supports full CRUD operations, filtering, sorting, and statistics.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Endpoints

### Health Check

#### GET /api/health
Check the health status of the API server.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "version": "1.0.0"
}
```

### Tasks

#### GET /api/tasks
Retrieve all tasks with optional filtering and sorting.

**Query Parameters:**
- `filter` (string, optional): Filter tasks by status or priority
  - `all` - All tasks (default)
  - `completed` - Completed tasks only
  - `pending` - Pending tasks only
  - `high` - High priority tasks only
  - `medium` - Medium priority tasks only
  - `low` - Low priority tasks only
- `sort` (string, optional): Sort tasks by field
  - `priority` - Sort by priority (high → medium → low)
  - `title` - Sort alphabetically by title
  - `createdAt` - Sort by creation date (default, newest first)
- `limit` (number, optional): Maximum number of tasks to return (1-100)
- `offset` (number, optional): Number of tasks to skip (for pagination)

**Example Request:**
```
GET /api/tasks?filter=high&sort=title&limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567890",
      "title": "High Priority Task",
      "description": "Task description",
      "priority": "high",
      "completed": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "count": 1,
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 1
  }
}
```

#### GET /api/tasks/:id
Retrieve a specific task by ID.

**Parameters:**
- `id` (string, required): Task ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "title": "Task Title",
    "description": "Task description",
    "priority": "high",
    "completed": false,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Task Title",
  "description": "Task description (optional)",
  "priority": "high|medium|low"
}
```

**Required Fields:**
- `title` (string): Task title (1-200 characters)

**Optional Fields:**
- `description` (string): Task description (max 1000 characters)
- `priority` (string): Task priority - `high`, `medium`, or `low` (default: `medium`)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "title": "Task Title",
    "description": "Task description",
    "priority": "high",
    "completed": false,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Task created successfully"
}
```

#### PUT /api/tasks/:id
Update an existing task.

**Parameters:**
- `id` (string, required): Task ID

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "priority": "medium",
  "completed": true
}
```

**All fields are optional. Only provided fields will be updated.**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "title": "Updated Task Title",
    "description": "Updated description",
    "priority": "medium",
    "completed": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  },
  "message": "Task updated successfully"
}
```

#### PATCH /api/tasks/:id/toggle
Toggle the completion status of a task.

**Parameters:**
- `id` (string, required): Task ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "title": "Task Title",
    "description": "Task description",
    "priority": "high",
    "completed": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  },
  "message": "Task toggled successfully"
}
```

#### DELETE /api/tasks/:id
Delete a task.

**Parameters:**
- `id` (string, required): Task ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "title": "Task Title",
    "description": "Task description",
    "priority": "high",
    "completed": false,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Task deleted successfully"
}
```

### Statistics

#### GET /api/stats
Get task statistics and analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 10,
    "completedTasks": 6,
    "pendingTasks": 4,
    "completionRate": 60,
    "priorityStats": {
      "high": 3,
      "medium": 4,
      "low": 3
    }
  }
}
```

## Data Models

### Task Object
```json
{
  "id": "string",           // Unique task identifier
  "title": "string",        // Task title (1-200 characters)
  "description": "string",  // Task description (max 1000 characters)
  "priority": "string",     // Priority level: "high", "medium", or "low"
  "completed": "boolean",  // Completion status
  "createdAt": "string",   // ISO 8601 timestamp
  "updatedAt": "string"    // ISO 8601 timestamp
}
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Common Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Title is required and must be a non-empty string"
}
```

#### Not Found (404)
```json
{
  "success": false,
  "error": "Task not found"
}
```

#### Rate Limited (429)
```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Please try again later"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP address
- **Headers**: Rate limit information is included in response headers
- **Exceeded**: Returns 429 status code when limit is exceeded

## CORS

The API supports Cross-Origin Resource Sharing (CORS):
- **Allowed Origins**: Configurable via `FRONTEND_URL` environment variable
- **Default**: `http://localhost:3000`
- **Credentials**: Supported for authenticated requests

## Examples

### Create a High Priority Task
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "priority": "high"
  }'
```

### Get All High Priority Tasks
```bash
curl "http://localhost:3001/api/tasks?filter=high"
```

### Update Task Completion
```bash
curl -X PUT http://localhost:3001/api/tasks/1234567890 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Toggle Task Completion
```bash
curl -X PATCH http://localhost:3001/api/tasks/1234567890/toggle
```

### Get Task Statistics
```bash
curl http://localhost:3001/api/stats
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | CORS origin | `http://localhost:3000` |

## Changelog

### Version 1.0.0
- Initial API release
- Full CRUD operations for tasks
- Filtering and sorting support
- Statistics endpoint
- Rate limiting and security features
