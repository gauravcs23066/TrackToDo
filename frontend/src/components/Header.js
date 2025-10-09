import React from 'react';
import { useTasks } from '../context/TaskContext';

const Header = () => {
  const { totalTasks, completedTasks, completionRate } = useTasks();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="header-title">TrackToDo</h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{totalTasks}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{completedTasks.length}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{completionRate}%</span>
              <span className="stat-label">Progress</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
