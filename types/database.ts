export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  tags: string[];
  isCompleted: boolean;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  endDate?: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  autoSaveInterval: number;
}