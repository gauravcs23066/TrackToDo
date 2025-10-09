const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const fs = require('fs');
const path = require('path');

// Data file path
const DATA_FILE = path.join(__dirname, '../../data/tasks.json');

// Helper functions
const readTasks = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
};

const writeTasks = (tasks) => {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing tasks:', error);
    return false;
  }
};

// GET /api/tasks - Get all tasks
router.get('/', (req, res) => {
  try {
    const tasks = readTasks();
    const { filter, sort, limit, offset } = req.query;
    
    let filteredTasks = [...tasks];
    
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
    
    // Apply pagination
    const startIndex = parseInt(offset) || 0;
    const endIndex = limit ? startIndex + parseInt(limit) : filteredTasks.length;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedTasks,
      count: filteredTasks.length,
      pagination: {
        offset: startIndex,
        limit: limit ? parseInt(limit) : filteredTasks.length,
        total: filteredTasks.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', (req, res) => {
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

// POST /api/tasks - Create new task
router.post('/', (req, res) => {
  try {
    const { title, description, priority } = req.body;
    
    // Create task using model
    const task = Task.create({
      title,
      description,
      priority
    });
    
    const tasks = readTasks();
    tasks.push(task.toJSON());
    
    if (writeTasks(tasks)) {
      res.status(201).json({
        success: true,
        data: task.toJSON(),
        message: 'Task created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save task'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: error.message
    });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', (req, res) => {
  try {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    const task = new Task(tasks[taskIndex]);
    const updatedTask = task.update(req.body);
    
    tasks[taskIndex] = updatedTask.toJSON();
    
    if (writeTasks(tasks)) {
      res.json({
        success: true,
        data: updatedTask.toJSON(),
        message: 'Task updated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update task'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: error.message
    });
  }
});

// PATCH /api/tasks/:id/toggle - Toggle task completion
router.patch('/:id/toggle', (req, res) => {
  try {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    const task = new Task(tasks[taskIndex]);
    const updatedTask = task.toggle();
    
    tasks[taskIndex] = updatedTask.toJSON();
    
    if (writeTasks(tasks)) {
      res.json({
        success: true,
        data: updatedTask.toJSON(),
        message: 'Task toggled successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to toggle task'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to toggle task',
      message: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
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

// GET /api/tasks/stats/summary - Get task statistics
router.get('/stats/summary', (req, res) => {
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
    
    const recentTasks = tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate,
        priorityStats,
        recentTasks
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

module.exports = router;
