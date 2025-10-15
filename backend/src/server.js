const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting - More generous for v2.0
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for better UX
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Data file path
const DATA_FILE = path.join(__dirname, '../data/tasks.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper functions
const readTasks = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
};

const writeTasks = (tasks) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing tasks:', error);
    return false;
  }
};

const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Analytics helper functions
const calculateCompletionTrend = (tasks) => {
  const completedTasks = tasks.filter(task => task.completed);
  const last7Days = completedTasks.filter(task => {
    const taskDate = new Date(task.updatedAt);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return taskDate >= sevenDaysAgo;
  });
  
  return {
    last7Days: last7Days.length,
    trend: last7Days.length > 0 ? 'increasing' : 'stable'
  };
};

const calculateProductivityScore = (tasks) => {
  const completedTasks = tasks.filter(task => task.completed);
  const highPriorityCompleted = completedTasks.filter(task => task.priority === 'high').length;
  const totalHighPriority = tasks.filter(task => task.priority === 'high').length;
  
  const score = totalHighPriority > 0 ? Math.round((highPriorityCompleted / totalHighPriority) * 100) : 0;
  return Math.min(score, 100);
};

const calculateCompletionRate = (tasks) => {
  const completed = tasks.filter(task => task.completed).length;
  return tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
};

const calculateAverageCompletionTime = (tasks) => {
  const completedTasks = tasks.filter(task => task.completed);
  if (completedTasks.length === 0) return 0;
  
  const totalTime = completedTasks.reduce((sum, task) => {
    const created = new Date(task.createdAt);
    const completed = new Date(task.updatedAt);
    return sum + (completed - created);
  }, 0);
  
  return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60 * 24)); // days
};

const calculatePriorityDistribution = (tasks) => {
  return {
    high: tasks.filter(task => task.priority === 'high').length,
    medium: tasks.filter(task => task.priority === 'medium').length,
    low: tasks.filter(task => task.priority === 'low').length
  };
};

const calculateProductivityTrends = (tasks) => {
  const now = new Date();
  const last30Days = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return (now - taskDate) <= (30 * 24 * 60 * 60 * 1000);
  });
  
  return {
    tasksCreatedLast30Days: last30Days.length,
    averageTasksPerWeek: Math.round(last30Days.length / 4.3)
  };
};

const generateRecommendations = (tasks) => {
  const recommendations = [];
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const highPriorityPending = pendingTasks.filter(task => task.priority === 'high');
  
  if (highPriorityPending.length > 3) {
    recommendations.push('Consider focusing on high-priority tasks to improve productivity');
  }
  
  if (completedTasks.length === 0 && tasks.length > 0) {
    recommendations.push('Start completing tasks to build momentum');
  }
  
  if (tasks.length > 50) {
    recommendations.push('Consider organizing tasks into categories or projects');
  }
  
  return recommendations;
};

// Routes

// Health check - Enhanced for v2.0
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    features: {
      mobileOptimized: true,
      accessibilityCompliant: true,
      performanceOptimized: true
    }
  };
  
  res.json(healthData);
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = readTasks();
    const { filter, sort } = req.query;
    
    let filteredTasks = tasks;
    
    // Apply filters
    if (filter) {
      switch (filter) {
        case 'completed':
          filteredTasks = tasks.filter(task => task.completed);
          break;
        case 'pending':
          filteredTasks = tasks.filter(task => !task.completed);
          break;
        case 'high':
          filteredTasks = tasks.filter(task => task.priority === 'high');
          break;
        case 'medium':
          filteredTasks = tasks.filter(task => task.priority === 'medium');
          break;
        case 'low':
          filteredTasks = tasks.filter(task => task.priority === 'low');
          break;
      }
    }
    
    // Apply sorting
    if (sort) {
      switch (sort) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
          break;
        case 'title':
          filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'createdAt':
        default:
          filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }
    }
    
    res.json({
      success: true,
      data: filteredTasks,
      count: filteredTasks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
});

// Get task by ID
app.get('/api/tasks/:id', (req, res) => {
  try {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      message: error.message
    });
  }
});

// Create new task
app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, priority } = req.body;
    
    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    if (priority && !['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be high, medium, or low'
      });
    }
    
    const tasks = readTasks();
    const newTask = {
      id: generateId(),
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    
    if (writeTasks(tasks)) {
      res.status(201).json({
        success: true,
        data: newTask,
        message: 'Task created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save task'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      message: error.message
    });
  }
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    const { title, description, priority, completed } = req.body;
    const task = tasks[taskIndex];
    
    // Update fields if provided
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (priority !== undefined) {
      if (!['high', 'medium', 'low'].includes(priority)) {
        return res.status(400).json({
          success: false,
          error: 'Priority must be high, medium, or low'
        });
      }
      task.priority = priority;
    }
    if (completed !== undefined) task.completed = Boolean(completed);
    
    task.updatedAt = new Date().toISOString();
    
    if (writeTasks(tasks)) {
      res.json({
        success: true,
        data: task,
        message: 'Task updated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update task'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      message: error.message
    });
  }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    
    if (writeTasks(tasks)) {
      res.json({
        success: true,
        data: deletedTask,
        message: 'Task deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete task'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      message: error.message
    });
  }
});

// Get statistics - Enhanced for v2.0
app.get('/api/stats', (req, res) => {
  try {
    const tasks = readTasks();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const priorityStats = {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length
    };
    
    // Performance metrics
    const performanceMetrics = {
      averageTasksPerDay: Math.round(totalTasks / Math.max(1, Math.ceil((Date.now() - new Date('2023-01-01').getTime()) / (1000 * 60 * 60 * 24)))),
      completionTrend: calculateCompletionTrend(tasks),
      productivityScore: calculateProductivityScore(tasks)
    };
    
    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate,
        priorityStats,
        performanceMetrics,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// New v2.0 endpoints

// Bulk operations for better performance
app.post('/api/tasks/bulk', (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        error: 'Tasks must be an array'
      });
    }
    
    const tasksData = readTasks();
    const newTasks = tasks.map(task => ({
      id: generateId(),
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      completed: task.completed || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    tasksData.push(...newTasks);
    
    if (writeTasks(tasksData)) {
      res.status(201).json({
        success: true,
        data: newTasks,
        message: `${newTasks.length} tasks created successfully`
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save tasks'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create tasks',
      message: error.message
    });
  }
});

// Search tasks with advanced filtering
app.get('/api/tasks/search', (req, res) => {
  try {
    const { q, priority, completed, dateFrom, dateTo, sort } = req.query;
    const tasks = readTasks();
    
    let filteredTasks = [...tasks];
    
    // Text search
    if (q) {
      const searchTerm = q.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Priority filter
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    
    // Completion filter
    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      filteredTasks = filteredTasks.filter(task => task.completed === isCompleted);
    }
    
    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredTasks = filteredTasks.filter(task => new Date(task.createdAt) >= fromDate);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredTasks = filteredTasks.filter(task => new Date(task.createdAt) <= toDate);
    }
    
    // Sorting
    if (sort) {
      switch (sort) {
        case 'title':
          filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
          break;
        case 'createdAt':
        default:
          filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }
    }
    
    res.json({
      success: true,
      data: filteredTasks,
      count: filteredTasks.length,
      query: { q, priority, completed, dateFrom, dateTo, sort }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search tasks',
      message: error.message
    });
  }
});

// Performance analytics
app.get('/api/analytics', (req, res) => {
  try {
    const tasks = readTasks();
    const analytics = {
      totalTasks: tasks.length,
      completionRate: calculateCompletionRate(tasks),
      averageCompletionTime: calculateAverageCompletionTime(tasks),
      priorityDistribution: calculatePriorityDistribution(tasks),
      productivityTrends: calculateProductivityTrends(tasks),
      recommendations: generateRecommendations(tasks)
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TrackToDo Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 API docs: http://localhost:${PORT}/api/tasks`);
});

module.exports = app;
