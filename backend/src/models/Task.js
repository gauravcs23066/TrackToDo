/**
 * Task Model
 * Represents a task in the TrackToDo application
 */

class Task {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.description = data.description || '';
    this.priority = data.priority || 'medium';
    this.completed = data.completed || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Generate a unique ID for the task
   * @returns {string} Unique task ID
   */
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Validate task data
   * @param {Object} data - Task data to validate
   * @returns {Object} Validation result
   */
  static validate(data) {
    const errors = [];

    // Title validation
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string');
    } else if (data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    // Description validation
    if (data.description && typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else if (data.description && data.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    // Priority validation
    if (data.priority && !['high', 'medium', 'low'].includes(data.priority)) {
      errors.push('Priority must be one of: high, medium, low');
    }

    // Completed validation
    if (data.completed !== undefined && typeof data.completed !== 'boolean') {
      errors.push('Completed must be a boolean value');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a new task instance
   * @param {Object} data - Task data
   * @returns {Task} New task instance
   */
  static create(data) {
    const validation = Task.validate(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return new Task({
      ...data,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      priority: data.priority || 'medium',
      completed: data.completed || false
    });
  }

  /**
   * Update task with new data
   * @param {Object} updates - Data to update
   * @returns {Task} Updated task instance
   */
  update(updates) {
    const validation = Task.validate({ ...this, ...updates });
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Update fields
    if (updates.title !== undefined) this.title = updates.title.trim();
    if (updates.description !== undefined) this.description = updates.description.trim();
    if (updates.priority !== undefined) this.priority = updates.priority;
    if (updates.completed !== undefined) this.completed = Boolean(updates.completed);
    
    this.updatedAt = new Date().toISOString();
    
    return this;
  }

  /**
   * Toggle task completion status
   * @returns {Task} Updated task instance
   */
  toggle() {
    this.completed = !this.completed;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Get task as plain object
   * @returns {Object} Task data
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      completed: this.completed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Get task summary
   * @returns {Object} Task summary
   */
  getSummary() {
    return {
      id: this.id,
      title: this.title,
      priority: this.priority,
      completed: this.completed,
      createdAt: this.createdAt
    };
  }

  /**
   * Check if task is overdue (for future enhancement)
   * @returns {boolean} True if task is overdue
   */
  isOverdue() {
    // This could be enhanced with due dates
    return false;
  }

  /**
   * Get priority weight for sorting
   * @returns {number} Priority weight
   */
  getPriorityWeight() {
    const weights = { high: 3, medium: 2, low: 1 };
    return weights[this.priority] || 0;
  }
}

module.exports = Task;
