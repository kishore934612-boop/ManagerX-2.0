import * as SQLite from 'expo-sqlite';
import { Task, Note, Category, User } from '../types/database';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('managex.db');
      await this.createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT,
        user_id TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
        category TEXT,
        tags TEXT,
        is_completed INTEGER DEFAULT 0,
        is_recurring INTEGER DEFAULT 0,
        recurrence_pattern TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        color TEXT DEFAULT '#ffffff',
        is_pinned INTEGER DEFAULT 0,
        tags TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned);
    `);
  }

  // User operations
  async createUser(user: Omit<User, 'createdAt'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(
      'INSERT OR REPLACE INTO users (id, email, display_name) VALUES (?, ?, ?)',
      [user.id, user.email, user.displayName || null]
    );
  }

  async getUser(userId: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    ) as any;
    
    return result ? {
      id: result.id,
      email: result.email,
      displayName: result.display_name,
      createdAt: result.created_at
    } : null;
  }

  // Task operations
  async createTask(task: Omit<Task, 'createdAt' | 'updatedAt'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      INSERT INTO tasks (id, title, description, due_date, priority, category, tags, is_completed, is_recurring, recurrence_pattern, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      task.id,
      task.title,
      task.description || null,
      task.dueDate || null,
      task.priority,
      task.category,
      JSON.stringify(task.tags),
      task.isCompleted ? 1 : 0,
      task.isRecurring ? 1 : 0,
      task.recurrencePattern ? JSON.stringify(task.recurrencePattern) : null,
      task.userId
    ]);
  }

  async getTasks(userId: string): Promise<Task[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const results = await this.db.getAllAsync(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    ) as any[];
    
    return results.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      priority: row.priority as 'high' | 'medium' | 'low',
      category: row.category,
      tags: JSON.parse(row.tags || '[]'),
      isCompleted: Boolean(row.is_completed),
      isRecurring: Boolean(row.is_recurring),
      recurrencePattern: row.recurrence_pattern ? JSON.parse(row.recurrence_pattern) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id
    }));
  }

  async updateTask(task: Task): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE tasks SET 
        title = ?, description = ?, due_date = ?, priority = ?, category = ?, 
        tags = ?, is_completed = ?, is_recurring = ?, recurrence_pattern = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [
      task.title,
      task.description || null,
      task.dueDate || null,
      task.priority,
      task.category,
      JSON.stringify(task.tags),
      task.isCompleted ? 1 : 0,
      task.isRecurring ? 1 : 0,
      task.recurrencePattern ? JSON.stringify(task.recurrencePattern) : null,
      task.id,
      task.userId
    ]);
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
  }

  // Note operations
  async createNote(note: Omit<Note, 'createdAt' | 'updatedAt'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      INSERT INTO notes (id, title, content, color, is_pinned, tags, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      note.id,
      note.title,
      note.content,
      note.color,
      note.isPinned ? 1 : 0,
      JSON.stringify(note.tags),
      note.userId
    ]);
  }

  async getNotes(userId: string): Promise<Note[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const results = await this.db.getAllAsync(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY is_pinned DESC, created_at DESC',
      [userId]
    ) as any[];
    
    return results.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      color: row.color,
      isPinned: Boolean(row.is_pinned),
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id
    }));
  }

  async updateNote(note: Note): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE notes SET 
        title = ?, content = ?, color = ?, is_pinned = ?, tags = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [
      note.title,
      note.content,
      note.color,
      note.isPinned ? 1 : 0,
      JSON.stringify(note.tags),
      note.id,
      note.userId
    ]);
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
  }

  // Category operations
  async createCategory(category: Category): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(
      'INSERT INTO categories (id, name, color, icon, user_id) VALUES (?, ?, ?, ?, ?)',
      [category.id, category.name, category.color, category.icon, category.userId]
    );
  }

  async getCategories(userId: string): Promise<Category[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const results = await this.db.getAllAsync(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY name',
      [userId]
    ) as any[];
    
    return results.map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      userId: row.user_id
    }));
  }

  async deleteCategory(categoryId: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync('DELETE FROM categories WHERE id = ? AND user_id = ?', [categoryId, userId]);
  }

  async searchTasks(userId: string, query: string): Promise<Task[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const results = await this.db.getAllAsync(`
      SELECT * FROM tasks 
      WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)
      ORDER BY created_at DESC
    `, [userId, `%${query}%`, `%${query}%`]) as any[];
    
    return results.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      priority: row.priority as 'high' | 'medium' | 'low',
      category: row.category,
      tags: JSON.parse(row.tags || '[]'),
      isCompleted: Boolean(row.is_completed),
      isRecurring: Boolean(row.is_recurring),
      recurrencePattern: row.recurrence_pattern ? JSON.parse(row.recurrence_pattern) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id
    }));
  }

  async searchNotes(userId: string, query: string): Promise<Note[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const results = await this.db.getAllAsync(`
      SELECT * FROM notes 
      WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)
      ORDER BY is_pinned DESC, created_at DESC
    `, [userId, `%${query}%`, `%${query}%`]) as any[];
    
    return results.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      color: row.color,
      isPinned: Boolean(row.is_pinned),
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id
    }));
  }
}

export const databaseService = new DatabaseService();