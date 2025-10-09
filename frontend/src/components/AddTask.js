import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

const AddTask = () => {
  const { addTask } = useTasks();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriorityChange = (priority) => {
    setFormData(prev => ({
      ...prev,
      priority
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      addTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        completed: false
      });
      setFormData({
        title: '',
        description: '',
        priority: 'medium'
      });
      setIsFormVisible(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium'
    });
    setIsFormVisible(false);
  };

  if (!isFormVisible) {
    return (
      <section className="add-task-section">
        <div 
          className="add-task-card"
          onClick={() => setIsFormVisible(true)}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>+</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Add New Task
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Click here to create a new task
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="add-task-section">
      <form className="add-task-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter task title..."
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter task description..."
            rows="3"
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <div className="priority-group">
            <div
              className={`priority-option priority-high ${formData.priority === 'high' ? 'selected' : ''}`}
              onClick={() => handlePriorityChange('high')}
            >
              <span>🔴</span>
              <span>High</span>
            </div>
            <div
              className={`priority-option priority-medium ${formData.priority === 'medium' ? 'selected' : ''}`}
              onClick={() => handlePriorityChange('medium')}
            >
              <span>🟠</span>
              <span>Medium</span>
            </div>
            <div
              className={`priority-option priority-low ${formData.priority === 'low' ? 'selected' : ''}`}
              onClick={() => handlePriorityChange('low')}
            >
              <span>⚪</span>
              <span>Low</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!formData.title.trim()}
          >
            Add Task
          </button>
        </div>
      </form>
    </section>
  );
};

export default AddTask;
