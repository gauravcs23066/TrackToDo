import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

const TaskItem = ({ task, formatDate }) => {
  const { updateTask, deleteTask, toggleTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority
    });
  };

  const handleSave = () => {
    if (editData.title.trim()) {
      updateTask(task.id, editData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriorityChange = (priority) => {
    setEditData(prev => ({
      ...prev,
      priority
    }));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Priority';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟠';
      case 'low': return '⚪';
      default: return '⚪';
    }
  };

  if (isEditing) {
    return (
      <div className={`task-item priority-${task.priority} editing`}>
        <div className="task-header">
          <div className="task-priority">
            <span>{getPriorityIcon(editData.priority)}</span>
            <span>{getPriorityLabel(editData.priority)}</span>
          </div>
          <div className="task-actions">
            <button
              className="btn btn-sm btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleSave}
              disabled={!editData.title.trim()}
            >
              Save
            </button>
          </div>
        </div>

        <input
          type="text"
          name="title"
          value={editData.title}
          onChange={handleInputChange}
          className="form-input"
          style={{ marginBottom: 'var(--space-3)' }}
          placeholder="Task title..."
        />

        <textarea
          name="description"
          value={editData.description}
          onChange={handleInputChange}
          className="form-input"
          placeholder="Task description..."
          rows="3"
          style={{ marginBottom: 'var(--space-4)', resize: 'vertical', minHeight: '80px' }}
        />

        <div className="priority-group">
          <div
            className={`priority-option priority-high ${editData.priority === 'high' ? 'selected' : ''}`}
            onClick={() => handlePriorityChange('high')}
          >
            <span>🔴</span>
            <span>High</span>
          </div>
          <div
            className={`priority-option priority-medium ${editData.priority === 'medium' ? 'selected' : ''}`}
            onClick={() => handlePriorityChange('medium')}
          >
            <span>🟠</span>
            <span>Medium</span>
          </div>
          <div
            className={`priority-option priority-low ${editData.priority === 'low' ? 'selected' : ''}`}
            onClick={() => handlePriorityChange('low')}
          >
            <span>⚪</span>
            <span>Low</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <div className="task-priority">
          <span className="priority-dot"></span>
          <span>{getPriorityLabel(task.priority)}</span>
        </div>
        <div className="task-actions">
          <button
            className={`task-complete-btn ${task.completed ? 'completed' : ''}`}
            onClick={handleToggle}
          >
            {task.completed ? '✓ Completed' : 'Mark Complete'}
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>

      <h3 className="task-title">{task.title}</h3>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="task-date">
          <span>📅</span>
          <span>Created {formatDate(task.createdAt)}</span>
        </div>
        {task.updatedAt !== task.createdAt && (
          <div className="task-date">
            <span>🔄</span>
            <span>Updated {formatDate(task.updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
