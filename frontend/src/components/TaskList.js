import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskItem from './TaskItem';

const TaskList = () => {
  const { filteredTasks, setFilter, filter } = useTasks();
  const [sortBy, setSortBy] = useState('createdAt');

  const filters = [
    { key: 'all', label: 'All Tasks' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'high', label: 'High Priority' },
    { key: 'medium', label: 'Medium Priority' },
    { key: 'low', label: 'Low Priority' }
  ];

  const sortOptions = [
    { key: 'createdAt', label: 'Date Created' },
    { key: 'priority', label: 'Priority' },
    { key: 'title', label: 'Title' }
  ];

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'title':
        return a.title.localeCompare(b.title);
      case 'createdAt':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (filteredTasks.length === 0) {
    return (
      <section className="task-list-section">
        <div className="task-list-header">
          <h2 className="task-list-title">Tasks</h2>
          <div className="task-filters">
            {filters.map(filterOption => (
              <button
                key={filterOption.key}
                className={`filter-btn ${filter === filterOption.key ? 'active' : ''}`}
                onClick={() => setFilter(filterOption.key)}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3 className="empty-state-title">No tasks found</h3>
          <p className="empty-state-text">
            {filter === 'all' 
              ? "You don't have any tasks yet. Create your first task to get started!"
              : `No tasks match the "${filters.find(f => f.key === filter)?.label}" filter.`
            }
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="task-list-section">
      <div className="task-list-header">
        <h2 className="task-list-title">
          Tasks ({filteredTasks.length})
        </h2>
        <div className="task-filters">
          {filters.map(filterOption => (
            <button
              key={filterOption.key}
              className={`filter-btn ${filter === filterOption.key ? 'active' : ''}`}
              onClick={() => setFilter(filterOption.key)}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      <div className="task-list">
        {sortedTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            formatDate={formatDate}
          />
        ))}
      </div>
    </section>
  );
};

export default TaskList;
