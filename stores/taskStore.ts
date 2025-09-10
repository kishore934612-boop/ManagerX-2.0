import { create } from 'zustand';
import { Task, Category } from '../types/database';
import { databaseService } from '../services/database';
import * as Notifications from 'expo-notifications';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  filteredTasks: Task[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterPriority: string | null;
  filterCategory: string | null;
  showCompleted: boolean;
  
  // Actions
  loadTasks: (userId: string) => Promise<void>;
  loadCategories: (userId: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  createCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterPriority: (priority: string | null) => void;
  setFilterCategory: (category: string | null) => void;
  setShowCompleted: (show: boolean) => void;
  applyFilters: () => void;
  scheduleNotification: (task: Task) => Promise<void>;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  categories: [],
  filteredTasks: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filterPriority: null,
  filterCategory: null,
  showCompleted: true,

  loadTasks: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const tasks = await databaseService.getTasks(userId);
      set({ tasks, isLoading: false });
      get().applyFilters();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load tasks',
        isLoading: false 
      });
    }
  },

  loadCategories: async (userId: string) => {
    try {
      const categories = await databaseService.getCategories(userId);
      
      // Add default categories if none exist
      if (categories.length === 0) {
        const defaultCategories = [
          { id: 'work', name: 'Work', color: '#3b82f6', icon: 'work', userId },
          { id: 'personal', name: 'Personal', color: '#10b981', icon: 'person', userId },
          { id: 'shopping', name: 'Shopping', color: '#f59e0b', icon: 'shopping-cart', userId },
          { id: 'health', name: 'Health', color: '#ef4444', icon: 'heart', userId }
        ];
        
        for (const category of defaultCategories) {
          await databaseService.createCategory(category);
        }
        
        const updatedCategories = await databaseService.getCategories(userId);
        set({ categories: updatedCategories });
      } else {
        set({ categories });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load categories'
      });
    }
  },

  createTask: async (taskData) => {
    try {
      const task: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await databaseService.createTask(task);
      
      // Schedule notification if due date is set
      if (task.dueDate) {
        await get().scheduleNotification(task);
      }
      
      const { tasks } = get();
      const updatedTasks = [task, ...tasks];
      set({ tasks: updatedTasks });
      get().applyFilters();
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create task'
      });
    }
  },

  updateTask: async (task) => {
    try {
      const updatedTask = { ...task, updatedAt: new Date().toISOString() };
      await databaseService.updateTask(updatedTask);
      
      // Update notification if due date changed
      if (task.dueDate) {
        await get().scheduleNotification(updatedTask);
      }
      
      const { tasks } = get();
      const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t);
      set({ tasks: updatedTasks });
      get().applyFilters();
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update task'
      });
    }
  },

  deleteTask: async (taskId) => {
    try {
      const { tasks } = get();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      await databaseService.deleteTask(taskId, task.userId);
      
      // Cancel notification
      await Notifications.cancelScheduledNotificationAsync(taskId);
      
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      set({ tasks: updatedTasks });
      get().applyFilters();
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete task'
      });
    }
  },

  toggleTaskComplete: async (taskId) => {
    try {
      const { tasks } = get();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const updatedTask = { 
        ...task, 
        isCompleted: !task.isCompleted,
        updatedAt: new Date().toISOString()
      };
      
      await databaseService.updateTask(updatedTask);
      
      const updatedTasks = tasks.map(t => t.id === taskId ? updatedTask : t);
      set({ tasks: updatedTasks });
      get().applyFilters();
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle task'
      });
    }
  },

  createCategory: async (categoryData) => {
    try {
      const category: Category = {
        ...categoryData,
        id: `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      await databaseService.createCategory(category);
      
      const { categories } = get();
      set({ categories: [...categories, category] });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create category'
      });
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      const { categories } = get();
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
      
      await databaseService.deleteCategory(categoryId, category.userId);
      
      const updatedCategories = categories.filter(c => c.id !== categoryId);
      set({ categories: updatedCategories });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete category'
      });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setFilterPriority: (priority) => {
    set({ filterPriority: priority });
    get().applyFilters();
  },

  setFilterCategory: (category) => {
    set({ filterCategory: category });
    get().applyFilters();
  },

  setShowCompleted: (show) => {
    set({ showCompleted: show });
    get().applyFilters();
  },

  applyFilters: () => {
    const { tasks, searchQuery, filterPriority, filterCategory, showCompleted } = get();
    
    let filtered = tasks.filter(task => {
      // Search query filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Priority filter
      if (filterPriority && task.priority !== filterPriority) {
        return false;
      }
      
      // Category filter
      if (filterCategory && task.category !== filterCategory) {
        return false;
      }
      
      // Completion filter
      if (!showCompleted && task.isCompleted) {
        return false;
      }
      
      return true;
    });

    // Sort by completion status, then by due date, then by priority
    filtered.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    set({ filteredTasks: filtered });
  },

  scheduleNotification: async (task) => {
    try {
      if (!task.dueDate) return;
      
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      
      if (dueDate <= now) return;
      
      // Cancel existing notification
      await Notifications.cancelScheduledNotificationAsync(task.id);
      
      // Schedule new notification
      await Notifications.scheduleNotificationAsync({
        identifier: task.id,
        content: {
          title: 'Task Reminder',
          body: `"${task.title}" is due now`,
          data: { taskId: task.id }
        },
        trigger: dueDate
      });
      
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));