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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
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

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
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

// Get statistics
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
    
    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate,
        priorityStats
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
