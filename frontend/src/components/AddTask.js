import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useFormValidation, ValidatedInput, ValidatedTextarea, LoadingSpinner, Toast } from './FormValidation';

const AddTask = () => {
  const { addTask } = useTasks();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const validationRules = {
    title: {
      required: 'Title is required',
      minLength: 'Title must be at least 3 characters',
      maxLength: 'Title must be less than 200 characters'
    },
    description: {
      maxLength: 'Description must be less than 1000 characters'
    }
  };

  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    isValid
  } = useFormValidation(
    { title: '', description: '', priority: 'medium' },
    validationRules
  );

  const handleInputChange = (name, value) => {
    handleChange(name, value);
  };

  const handlePriorityChange = (priority) => {
    handleChange('priority', priority);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      addTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        completed: false
      });
      
      setToast({ message: 'Task created successfully!', type: 'success' });
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      setToast({ message: 'Failed to create task. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
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
        <ValidatedInput
          name="title"
          label="Task Title"
          value={formData.title}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.title}
          touched={touched.title}
          placeholder="Enter task title..."
          maxLength={200}
          required
        />

        <ValidatedTextarea
          name="description"
          label="Description (Optional)"
          value={formData.description}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.description}
          touched={touched.description}
          placeholder="Enter task description..."
          maxLength={1000}
          rows={3}
        />

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
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isValid || isLoading}
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Add Task'}
          </button>
        </div>
      </form>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </section>
  );
};

export default AddTask;
