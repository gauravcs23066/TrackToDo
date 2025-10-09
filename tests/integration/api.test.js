/**
 * Integration Tests for TrackToDo API
 * Tests the complete API workflow and data persistence
 */

const request = require('supertest');
const app = require('../../backend/src/server');
const fs = require('fs');
const path = require('path');

// Test data file path
const DATA_FILE = path.join(__dirname, '../../backend/data/tasks.json');

// Helper function to reset test data
const resetTestData = () => {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
};

describe('TrackToDo API Integration Tests', () => {
  beforeEach(() => {
    resetTestData();
  });

  afterAll(() => {
    // Clean up test data
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
  });

  describe('Complete Task Lifecycle', () => {
    test('should handle complete task lifecycle: create, read, update, delete', async () => {
      // 1. Create a new task
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Integration Test Task',
          description: 'This is a test task for integration testing',
          priority: 'high'
        })
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.title).toBe('Integration Test Task');
      expect(createResponse.body.data.priority).toBe('high');
      expect(createResponse.body.data.completed).toBe(false);

      const taskId = createResponse.body.data.id;

      // 2. Read the created task
      const readResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(readResponse.body.success).toBe(true);
      expect(readResponse.body.data.id).toBe(taskId);
      expect(readResponse.body.data.title).toBe('Integration Test Task');

      // 3. Update the task
      const updateResponse = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          title: 'Updated Integration Test Task',
          completed: true
        })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.title).toBe('Updated Integration Test Task');
      expect(updateResponse.body.data.completed).toBe(true);

      // 4. Verify the update persisted
      const verifyResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(verifyResponse.body.data.title).toBe('Updated Integration Test Task');
      expect(verifyResponse.body.data.completed).toBe(true);

      // 5. Delete the task
      const deleteResponse = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.data.id).toBe(taskId);

      // 6. Verify task is deleted
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(404);
    });
  });

  describe('Data Persistence', () => {
    test('should persist data across multiple requests', async () => {
      // Create multiple tasks
      const tasks = [
        { title: 'Task 1', priority: 'high' },
        { title: 'Task 2', priority: 'medium' },
        { title: 'Task 3', priority: 'low' }
      ];

      const createdTasks = [];
      for (const task of tasks) {
        const response = await request(app)
          .post('/api/tasks')
          .send(task)
          .expect(201);
        createdTasks.push(response.body.data);
      }

      // Verify all tasks are persisted
      const allTasksResponse = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(allTasksResponse.body.data).toHaveLength(3);
      expect(allTasksResponse.body.count).toBe(3);

      // Verify individual tasks can be retrieved
      for (const task of createdTasks) {
        const response = await request(app)
          .get(`/api/tasks/${task.id}`)
          .expect(200);
        expect(response.body.data.id).toBe(task.id);
      }
    });

    test('should maintain data integrity during concurrent operations', async () => {
      // Create initial task
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Concurrent Test Task', priority: 'high' })
        .expect(201);

      const taskId = createResponse.body.data.id;

      // Perform multiple concurrent updates
      const updatePromises = [
        request(app).put(`/api/tasks/${taskId}`).send({ title: 'Update 1' }),
        request(app).put(`/api/tasks/${taskId}`).send({ title: 'Update 2' }),
        request(app).put(`/api/tasks/${taskId}`).send({ completed: true })
      ];

      const results = await Promise.all(updatePromises);
      
      // All updates should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
      });

      // Verify final state
      const finalResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(finalResponse.body.data).toHaveProperty('id', taskId);
      expect(finalResponse.body.data.updatedAt).toBeDefined();
    });
  });

  describe('Filtering and Sorting Integration', () => {
    beforeEach(async () => {
      // Create test data
      const testTasks = [
        { title: 'High Priority Task', priority: 'high', completed: false },
        { title: 'Medium Priority Task', priority: 'medium', completed: true },
        { title: 'Low Priority Task', priority: 'low', completed: false },
        { title: 'Another High Task', priority: 'high', completed: true }
      ];

      for (const task of testTasks) {
        await request(app)
          .post('/api/tasks')
          .send(task);
      }
    });

    test('should filter and sort tasks correctly', async () => {
      // Test filtering by priority
      const highPriorityResponse = await request(app)
        .get('/api/tasks?filter=high')
        .expect(200);

      expect(highPriorityResponse.body.data).toHaveLength(2);
      highPriorityResponse.body.data.forEach(task => {
        expect(task.priority).toBe('high');
      });

      // Test filtering by completion status
      const completedResponse = await request(app)
        .get('/api/tasks?filter=completed')
        .expect(200);

      expect(completedResponse.body.data).toHaveLength(2);
      completedResponse.body.data.forEach(task => {
        expect(task.completed).toBe(true);
      });

      // Test sorting by priority
      const sortedResponse = await request(app)
        .get('/api/tasks?sort=priority')
        .expect(200);

      expect(sortedResponse.body.data[0].priority).toBe('high');
      expect(sortedResponse.body.data[1].priority).toBe('high');
      expect(sortedResponse.body.data[2].priority).toBe('medium');
      expect(sortedResponse.body.data[3].priority).toBe('low');
    });

    test('should handle combined filtering and sorting', async () => {
      // Filter by high priority and sort by title
      const response = await request(app)
        .get('/api/tasks?filter=high&sort=title')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe('Another High Task');
      expect(response.body.data[1].title).toBe('High Priority Task');
    });
  });

  describe('Statistics Integration', () => {
    test('should provide accurate statistics', async () => {
      // Create tasks with different priorities and completion status
      const testTasks = [
        { title: 'Task 1', priority: 'high', completed: true },
        { title: 'Task 2', priority: 'high', completed: false },
        { title: 'Task 3', priority: 'medium', completed: true },
        { title: 'Task 4', priority: 'low', completed: false }
      ];

      for (const task of testTasks) {
        await request(app)
          .post('/api/tasks')
          .send(task);
      }

      // Get statistics
      const statsResponse = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(statsResponse.body.data.totalTasks).toBe(4);
      expect(statsResponse.body.data.completedTasks).toBe(2);
      expect(statsResponse.body.data.pendingTasks).toBe(2);
      expect(statsResponse.body.data.completionRate).toBe(50);
      expect(statsResponse.body.data.priorityStats.high).toBe(2);
      expect(statsResponse.body.data.priorityStats.medium).toBe(1);
      expect(statsResponse.body.data.priorityStats.low).toBe(1);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle malformed requests gracefully', async () => {
      // Test invalid JSON
      await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      // Test missing required fields
      await request(app)
        .post('/api/tasks')
        .send({})
        .expect(400);

      // Test invalid priority
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', priority: 'invalid' })
        .expect(400);
    });

    test('should handle non-existent resources', async () => {
      // Test non-existent task ID
      await request(app)
        .get('/api/tasks/non-existent')
        .expect(404);

      await request(app)
        .put('/api/tasks/non-existent')
        .send({ title: 'Updated' })
        .expect(404);

      await request(app)
        .delete('/api/tasks/non-existent')
        .expect(404);
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle multiple rapid requests', async () => {
      const requests = [];
      
      // Create 10 tasks rapidly
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/tasks')
            .send({ title: `Rapid Task ${i}`, priority: 'medium' })
        );
      }

      const results = await Promise.all(requests);
      
      // All requests should succeed
      results.forEach(result => {
        expect(result.status).toBe(201);
        expect(result.body.success).toBe(true);
      });

      // Verify all tasks were created
      const allTasksResponse = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(allTasksResponse.body.data).toHaveLength(10);
    });

    test('should handle large task lists efficiently', async () => {
      // Create 50 tasks
      for (let i = 0; i < 50; i++) {
        await request(app)
          .post('/api/tasks')
          .send({ 
            title: `Bulk Task ${i}`, 
            priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
            completed: i % 2 === 0
          });
      }

      // Test filtering and sorting on large dataset
      const response = await request(app)
        .get('/api/tasks?filter=high&sort=title')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach(task => {
        expect(task.priority).toBe('high');
      });
    });
  });
});
