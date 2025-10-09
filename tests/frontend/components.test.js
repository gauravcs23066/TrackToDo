/**
 * Frontend Component Tests
 * Testing React components for TrackToDo application
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskProvider } from '../../frontend/src/context/TaskContext';
import Header from '../../frontend/src/components/Header';
import AddTask from '../../frontend/src/components/AddTask';
import TaskList from '../../frontend/src/components/TaskList';
import TaskItem from '../../frontend/src/components/TaskItem';
import ProgressBar from '../../frontend/src/components/ProgressBar';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Helper function to render components with TaskProvider
const renderWithProvider = (component) => {
  return render(
    <TaskProvider>
      {component}
    </TaskProvider>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
  });

  test('renders TrackToDo title', () => {
    renderWithProvider(<Header />);
    expect(screen.getByText('TrackToDo')).toBeInTheDocument();
  });

  test('displays task statistics', () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', completed: true },
      { id: '2', title: 'Task 2', completed: false }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));

    renderWithProvider(<Header />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // Total tasks
    expect(screen.getByText('1')).toBeInTheDocument(); // Completed tasks
    expect(screen.getByText('50%')).toBeInTheDocument(); // Progress
  });

  test('displays zero statistics for empty task list', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
    
    renderWithProvider(<Header />);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // Total tasks
    expect(screen.getByText('0%')).toBeInTheDocument(); // Progress
  });
});

describe('AddTask Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
  });

  test('renders add task card initially', () => {
    renderWithProvider(<AddTask />);
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByText('Click here to create a new task')).toBeInTheDocument();
  });

  test('shows form when add task card is clicked', () => {
    renderWithProvider(<AddTask />);
    
    const addCard = screen.getByText('Add New Task');
    fireEvent.click(addCard);
    
    expect(screen.getByLabelText('Task Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (Optional)')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
  });

  test('allows creating a new task', async () => {
    renderWithProvider(<AddTask />);
    
    // Click to show form
    fireEvent.click(screen.getByText('Add New Task'));
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Task Title *'), {
      target: { value: 'Test Task' }
    });
    fireEvent.change(screen.getByLabelText('Description (Optional)'), {
      target: { value: 'Test Description' }
    });
    
    // Select high priority
    fireEvent.click(screen.getByText('High'));
    
    // Submit form
    fireEvent.click(screen.getByText('Add Task'));
    
    // Verify task was added to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('validates required title field', () => {
    renderWithProvider(<AddTask />);
    
    // Click to show form
    fireEvent.click(screen.getByText('Add New Task'));
    
    // Try to submit without title
    fireEvent.click(screen.getByText('Add Task'));
    
    // Add Task button should be disabled
    expect(screen.getByText('Add Task')).toBeDisabled();
  });

  test('cancels form and resets fields', () => {
    renderWithProvider(<AddTask />);
    
    // Click to show form
    fireEvent.click(screen.getByText('Add New Task'));
    
    // Fill some data
    fireEvent.change(screen.getByLabelText('Task Title *'), {
      target: { value: 'Test Task' }
    });
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Form should be hidden and show add card again
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });
});

describe('TaskList Component', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      priority: 'high',
      completed: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      priority: 'medium',
      completed: true,
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));
  });

  test('renders task list with filters', () => {
    renderWithProvider(<TaskList />);
    
    expect(screen.getByText('Tasks (2)')).toBeInTheDocument();
    expect(screen.getByText('All Tasks')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('filters tasks by completion status', () => {
    renderWithProvider(<TaskList />);
    
    // Click completed filter
    fireEvent.click(screen.getByText('Completed'));
    
    // Should show only completed tasks
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  });

  test('filters tasks by priority', () => {
    renderWithProvider(<TaskList />);
    
    // Click high priority filter
    fireEvent.click(screen.getByText('High Priority'));
    
    // Should show only high priority tasks
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
  });

  test('shows empty state when no tasks match filter', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
    
    renderWithProvider(<TaskList />);
    
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText("You don't have any tasks yet. Create your first task to get started!")).toBeInTheDocument();
  });
});

describe('TaskItem Component', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'high',
    completed: false,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
  });

  test('renders task information', () => {
    renderWithProvider(<TaskItem task={mockTask} formatDate={() => '2 hours ago'} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
    expect(screen.getByText('Mark Complete')).toBeInTheDocument();
  });

  test('allows editing task', () => {
    renderWithProvider(<TaskItem task={mockTask} formatDate={() => '2 hours ago'} />);
    
    // Click edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Should show edit form
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('allows toggling task completion', () => {
    renderWithProvider(<TaskItem task={mockTask} formatDate={() => '2 hours ago'} />);
    
    // Click mark complete button
    fireEvent.click(screen.getByText('Mark Complete'));
    
    // Should update localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('allows deleting task', () => {
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    
    renderWithProvider(<TaskItem task={mockTask} formatDate={() => '2 hours ago'} />);
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Should call confirm and update localStorage
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('shows completed task styling', () => {
    const completedTask = { ...mockTask, completed: true };
    
    renderWithProvider(<TaskItem task={completedTask} formatDate={() => '2 hours ago'} />);
    
    expect(screen.getByText('✓ Completed')).toBeInTheDocument();
  });
});

describe('ProgressBar Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
  });

  test('does not render when no tasks exist', () => {
    const { container } = renderWithProvider(<ProgressBar />);
    expect(container.firstChild).toBeNull();
  });

  test('renders progress information', () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', completed: true },
      { id: '2', title: 'Task 2', completed: false }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));
    
    renderWithProvider(<ProgressBar />);
    
    expect(screen.getByText('Progress Overview')).toBeInTheDocument();
    expect(screen.getByText('1 of 2 tasks completed (50%)')).toBeInTheDocument();
  });

  test('displays correct progress percentage', () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', completed: true },
      { id: '2', title: 'Task 2', completed: true },
      { id: '3', title: 'Task 3', completed: false }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));
    
    renderWithProvider(<ProgressBar />);
    
    expect(screen.getByText('2 of 3 tasks completed (67%)')).toBeInTheDocument();
  });
});

describe('Task Context Integration', () => {
  test('adds new task through context', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
    
    renderWithProvider(
      <div>
        <AddTask />
        <TaskList />
      </div>
    );
    
    // Click to show add form
    fireEvent.click(screen.getByText('Add New Task'));
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText('Task Title *'), {
      target: { value: 'New Task' }
    });
    fireEvent.click(screen.getByText('Add Task'));
    
    // Wait for task to appear in list
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('filters work across components', () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', completed: false, priority: 'high' },
      { id: '2', title: 'Task 2', completed: true, priority: 'medium' }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));
    
    renderWithProvider(<TaskList />);
    
    // Initially shows all tasks
    expect(screen.getByText('Tasks (2)')).toBeInTheDocument();
    
    // Filter by completed
    fireEvent.click(screen.getByText('Completed'));
    
    // Should show only completed tasks
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  });
});
