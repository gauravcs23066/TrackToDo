const request = require('supertest');
const app = require('../../backend/src/server');
const fs = require('fs');
const path = require('path');

// Test data file path
const DATA_FILE = path.join(__dirname, '../../backend/data/tasks.json');

// Helper function to reset test data
const resetTestData = () => {
  const testData = [
    {
      id: 'test-1',
      title: 'Test Task 1',
      description: 'Test description 1',
      priority: 'high',
      completed: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    },
    {
      id: 'test-2',
      title: 'Test Task 2',
      description: 'Test description 2',
      priority: 'medium',
      completed: true,
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z'
    }
  ];
  
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(testData, null, 2));
};

describe('TrackToDo API Tests', () => {
  beforeEach(() => {
    resetTestData();
  });

  afterAll(() => {
    // Clean up test data
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
  });

  describe('Health Check', () => {
    test('GET /api/health should return server status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Task CRUD Operations', () => {
    test('GET /api/tasks should return all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    test('GET /api/tasks/:id should return specific task', async () => {
      const response = await request(app)
        .get('/api/tasks/test-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('test-1');
      expect(response.body.data.title).toBe('Test Task 1');
    });

    test('GET /api/tasks/:id should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });

    test('POST /api/tasks should create new task', async () => {
      const newTask = {
        title: 'New Test Task',
        description: 'New test description',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Test Task');
      expect(response.body.data.priority).toBe('high');
      expect(response.body.data.completed).toBe(false);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    test('POST /api/tasks should return 400 for invalid data', async () => {
      const invalidTask = {
        title: '', // Empty title
        priority: 'invalid' // Invalid priority
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Title is required');
    });

    test('PUT /api/tasks/:id should update existing task', async () => {
      const updateData = {
        title: 'Updated Task Title',
        completed: true
      };

      const response = await request(app)
        .put('/api/tasks/test-1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Task Title');
      expect(response.body.data.completed).toBe(true);
      expect(response.body.data.updatedAt).not.toBe(response.body.data.createdAt);
    });

    test('PUT /api/tasks/:id should return 404 for non-existent task', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put('/api/tasks/non-existent')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });

    test('DELETE /api/tasks/:id should delete existing task', async () => {
      const response = await request(app)
        .delete('/api/tasks/test-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('test-1');
      expect(response.body.message).toBe('Task deleted successfully');
    });

    test('DELETE /api/tasks/:id should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('Task Filtering and Sorting', () => {
    test('GET /api/tasks?filter=completed should return only completed tasks', async () => {
      const response = await request(app)
        .get('/api/tasks?filter=completed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].completed).toBe(true);
    });

    test('GET /api/tasks?filter=pending should return only pending tasks', async () => {
      const response = await request(app)
        .get('/api/tasks?filter=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].completed).toBe(false);
    });

    test('GET /api/tasks?filter=high should return only high priority tasks', async () => {
      const response = await request(app)
        .get('/api/tasks?filter=high')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].priority).toBe('high');
    });

    test('GET /api/tasks?sort=priority should sort by priority', async () => {
      const response = await request(app)
        .get('/api/tasks?sort=priority')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].priority).toBe('high');
      expect(response.body.data[1].priority).toBe('medium');
    });

    test('GET /api/tasks?sort=title should sort by title', async () => {
      const response = await request(app)
        .get('/api/tasks?sort=title')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].title).toBe('Test Task 1');
      expect(response.body.data[1].title).toBe('Test Task 2');
    });
  });

  describe('Statistics', () => {
    test('GET /api/stats should return task statistics', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalTasks', 2);
      expect(response.body.data).toHaveProperty('completedTasks', 1);
      expect(response.body.data).toHaveProperty('pendingTasks', 1);
      expect(response.body.data).toHaveProperty('completionRate', 50);
      expect(response.body.data).toHaveProperty('priorityStats');
      expect(response.body.data.priorityStats).toHaveProperty('high', 1);
      expect(response.body.data.priorityStats).toHaveProperty('medium', 1);
      expect(response.body.data.priorityStats).toHaveProperty('low', 0);
    });
  });

  describe('Error Handling', () => {
    test('Should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    test('Should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Title is required');
    });

    test('Should handle invalid priority values', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          priority: 'invalid'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Priority must be high, medium, or low');
    });
  });

  describe('Data Validation', () => {
    test('Should trim whitespace from title and description', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: '  Test Task  ',
          description: '  Test Description  '
        })
        .expect(201);

      expect(response.body.data.title).toBe('Test Task');
      expect(response.body.data.description).toBe('Test Description');
    });

    test('Should handle long titles and descriptions', async () => {
      const longTitle = 'a'.repeat(201); // 201 characters
      const longDescription = 'b'.repeat(1001); // 1001 characters

      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: longTitle,
          description: longDescription
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
