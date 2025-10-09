import React from 'react';
import { useTasks } from '../context/TaskContext';

const ProgressBar = () => {
  const { totalTasks, completedTasks, completionRate } = useTasks();

  if (totalTasks === 0) {
    return null;
  }

  return (
    <section className="progress-section">
      <div className="progress-header">
        <h2 className="progress-title">Progress Overview</h2>
        <span className="progress-text">
          {completedTasks.length} of {totalTasks} tasks completed ({completionRate}%)
        </span>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{ width: `${completionRate}%` }}
        />
      </div>
    </section>
  );
};

export default ProgressBar;
