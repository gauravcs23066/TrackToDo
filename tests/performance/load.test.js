/**
 * Performance and Load Tests for TrackToDo API
 * Tests API performance under various load conditions
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

describe('TrackToDo API Performance Tests', () => {
  beforeEach(() => {
    resetTestData();
  });

  afterAll(() => {
    // Clean up test data
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
  });

  describe('Response Time Tests', () => {
    test('GET /api/health should respond quickly', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/health')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100); // Should respond in less than 100ms
    });

    test('GET /api/tasks should respond quickly with empty list', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/tasks')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(50); // Should respond in less than 50ms
    });

    test('POST /api/tasks should create tasks quickly', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Performance Test Task', priority: 'high' })
        .expect(201);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200); // Should respond in less than 200ms
    });
  });

  describe('Concurrent Request Handling', () => {
    test('should handle 10 concurrent GET requests', async () => {
      const requests = Array(10).fill().map(() => 
        request(app).get('/api/tasks')
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(1000); // Less than 1 second
    });

    test('should handle 5 concurrent POST requests', async () => {
      const requests = Array(5).fill().map((_, i) => 
        request(app)
          .post('/api/tasks')
          .send({ 
            title: `Concurrent Task ${i}`, 
            priority: 'medium' 
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(2000); // Less than 2 seconds
    });

    test('should handle mixed concurrent operations', async () => {
      // Create some initial data
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Initial Task', priority: 'high' });

      const requests = [
        request(app).get('/api/tasks'),
        request(app).post('/api/tasks').send({ title: 'New Task 1', priority: 'medium' }),
        request(app).get('/api/stats'),
        request(app).post('/api/tasks').send({ title: 'New Task 2', priority: 'low' }),
        request(app).get('/api/tasks?filter=high')
      ];

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBeLessThan(400);
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(1500); // Less than 1.5 seconds
    });
  });

  describe('Large Dataset Performance', () => {
    beforeEach(async () => {
      // Create 100 tasks for performance testing
      const tasks = Array(100).fill().map((_, i) => ({
        title: `Performance Task ${i}`,
        description: `Description for task ${i}`,
        priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
        completed: i % 2 === 0
      }));

      for (const task of tasks) {
        await request(app)
          .post('/api/tasks')
          .send(task);
      }
    });

    test('should handle large dataset queries efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      expect(response.body.data).toHaveLength(100);
      expect(responseTime).toBeLessThan(500); // Should respond in less than 500ms
    });

    test('should handle filtering on large dataset efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/tasks?filter=high')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(300); // Should respond in less than 300ms
    });

    test('should handle sorting on large dataset efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/tasks?sort=priority')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      expect(response.body.data).toHaveLength(100);
      expect(responseTime).toBeLessThan(400); // Should respond in less than 400ms
    });

    test('should handle statistics calculation efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/stats')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      expect(response.body.data.totalTasks).toBe(100);
      expect(responseTime).toBeLessThan(200); // Should respond in less than 200ms
    });
  });

  describe('Memory Usage Tests', () => {
    test('should not leak memory with repeated operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform 50 create/delete cycles
      for (let i = 0; i < 50; i++) {
        const createResponse = await request(app)
          .post('/api/tasks')
          .send({ title: `Memory Test Task ${i}`, priority: 'medium' });
        
        await request(app)
          .delete(`/api/tasks/${createResponse.body.data.id}`);
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Rate Limiting Tests', () => {
    test('should handle rate limiting gracefully', async () => {
      // Make many requests quickly to trigger rate limiting
      const requests = Array(150).fill().map(() => 
        request(app).get('/api/tasks')
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited (429 status)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      
      // Rate limited responses should have proper error message
      rateLimitedResponses.forEach(response => {
        expect(response.body.error).toContain('Too many requests');
      });
    });
  });

  describe('Data Consistency Tests', () => {
    test('should maintain data consistency under concurrent writes', async () => {
      // Create initial task
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Consistency Test Task', priority: 'high' });
      
      const taskId = createResponse.body.data.id;
      
      // Perform concurrent updates
      const updateRequests = Array(5).fill().map((_, i) => 
        request(app)
          .put(`/api/tasks/${taskId}`)
          .send({ title: `Updated Title ${i}` })
      );
      
      const responses = await Promise.all(updateRequests);
      
      // All updates should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
      
      // Verify final state is consistent
      const finalResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);
      
      expect(finalResponse.body.data.id).toBe(taskId);
      expect(finalResponse.body.data.title).toMatch(/Updated Title \d+/);
    });
  });

  describe('Error Recovery Tests', () => {
    test('should recover gracefully from invalid requests', async () => {
      const invalidRequests = [
        request(app).post('/api/tasks').send({}), // Missing title
        request(app).post('/api/tasks').send({ title: '', priority: 'invalid' }), // Invalid data
        request(app).get('/api/tasks/invalid-id'), // Invalid ID
        request(app).put('/api/tasks/invalid-id').send({ title: 'Test' }) // Invalid ID
      ];
      
      const responses = await Promise.all(invalidRequests);
      
      // All should return appropriate error status codes
      responses.forEach(response => {
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
      });
    });
  });
});
