/**
 * Validation middleware for TrackToDo API
 */

/**
 * Validate task creation/update data
 */
const validateTask = (req, res, next) => {
  const { title, description, priority, completed } = req.body;
  const errors = [];

  // Title validation
  if (req.method === 'POST' && (!title || typeof title !== 'string' || title.trim().length === 0)) {
    errors.push('Title is required and must be a non-empty string');
  } else if (title && (typeof title !== 'string' || title.trim().length === 0)) {
    errors.push('Title must be a non-empty string');
  } else if (title && title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Description validation
  if (description !== undefined && typeof description !== 'string') {
    errors.push('Description must be a string');
  } else if (description && description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  // Priority validation
  if (priority !== undefined && !['high', 'medium', 'low'].includes(priority)) {
    errors.push('Priority must be one of: high, medium, low');
  }

  // Completed validation
  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.push('Completed must be a boolean value');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Validate task ID parameter
 */
const validateTaskId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task ID'
    });
  }

  next();
};

/**
 * Validate query parameters
 */
const validateQuery = (req, res, next) => {
  const { filter, sort, limit, offset } = req.query;
  const errors = [];

  // Filter validation
  if (filter && !['all', 'completed', 'pending', 'high', 'medium', 'low'].includes(filter)) {
    errors.push('Filter must be one of: all, completed, pending, high, medium, low');
  }

  // Sort validation
  if (sort && !['priority', 'title', 'createdAt'].includes(sort)) {
    errors.push('Sort must be one of: priority, title, createdAt');
  }

  // Limit validation
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    errors.push('Limit must be a number between 1 and 100');
  }

  // Offset validation
  if (offset && (isNaN(offset) || parseInt(offset) < 0)) {
    errors.push('Offset must be a non-negative number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid query parameters',
      details: errors
    });
  }

  next();
};

/**
 * Sanitize input data
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    // Trim string fields
    if (req.body.title) {
      req.body.title = req.body.title.trim();
    }
    if (req.body.description) {
      req.body.description = req.body.description.trim();
    }
    
    // Ensure boolean values
    if (req.body.completed !== undefined) {
      req.body.completed = Boolean(req.body.completed);
    }
  }

  next();
};

/**
 * Rate limiting for specific endpoints
 */
const createRateLimit = (windowMs, max) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests',
      message: 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

module.exports = {
  validateTask,
  validateTaskId,
  validateQuery,
  sanitizeInput,
  createRateLimit
};
