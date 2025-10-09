import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Task Context
const TaskContext = createContext();

// Task Reducer
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        loading: false
      };
    
    case 'ADD_TASK':
      const newTask = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask]
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload, updatedAt: new Date().toISOString() }
            : task
        )
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
            : task
        )
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

// Initial State
const initialState = {
  tasks: [],
  filter: 'all',
  loading: true
};

// Task Provider Component
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tracktodo-tasks');
    if (savedTasks) {
      try {
        const tasks = JSON.parse(savedTasks);
        dispatch({ type: 'SET_TASKS', payload: tasks });
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (!state.loading) {
      localStorage.setItem('tracktodo-tasks', JSON.stringify(state.tasks));
    }
  }, [state.tasks, state.loading]);

  // Task Actions
  const addTask = (taskData) => {
    dispatch({ type: 'ADD_TASK', payload: taskData });
  };

  const updateTask = (taskId, updates) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, ...updates } });
  };

  const deleteTask = (taskId) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const toggleTask = (taskId) => {
    dispatch({ type: 'TOGGLE_TASK', payload: taskId });
  };

  const setFilter = (filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  // Computed values
  const filteredTasks = state.tasks.filter(task => {
    if (state.filter === 'all') return true;
    if (state.filter === 'completed') return task.completed;
    if (state.filter === 'pending') return !task.completed;
    if (state.filter === 'high') return task.priority === 'high';
    if (state.filter === 'medium') return task.priority === 'medium';
    if (state.filter === 'low') return task.priority === 'low';
    return true;
  });

  const completedTasks = state.tasks.filter(task => task.completed);
  const totalTasks = state.tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const value = {
    ...state,
    filteredTasks,
    completedTasks,
    totalTasks,
    completionRate,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    setFilter
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use TaskContext
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
