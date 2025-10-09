import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import ProgressBar from './components/ProgressBar';
import { TaskProvider } from './context/TaskContext';

function App() {
  return (
    <TaskProvider>
      <div className="App">
        <Header />
        <main className="main-content">
          <div className="container">
            <ProgressBar />
            <AddTask />
            <TaskList />
          </div>
        </main>
      </div>
    </TaskProvider>
  );
}

export default App;
