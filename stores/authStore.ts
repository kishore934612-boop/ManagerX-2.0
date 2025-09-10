import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/database';
import { databaseService } from '../services/database';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  loadStoredAuth: () => Promise<void>;
}

// Mock authentication service - in production, use Firebase Auth
class AuthService {
  async login(email: string, password: string): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'demo@managex.com' && password === 'demo123') {
      const user: User = {
        id: 'demo-user-id',
        email: email,
        displayName: 'Demo User',
        createdAt: new Date().toISOString()
      };
      return user;
    }
    
    throw new Error('Invalid credentials');
  }

  async register(email: string, password: string, displayName?: string): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: `user-${Date.now()}`,
      email: email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    return user;
  }
}

const authService = new AuthService();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const user = await authService.login(email, password);
      
      // Store user data securely
      await SecureStore.setItemAsync('user_token', JSON.stringify({ userId: user.id }));
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      // Create user in local database
      await databaseService.createUser(user);
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false 
      });
    }
  },

  register: async (email: string, password: string, displayName?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const user = await authService.register(email, password, displayName);
      
      // Store user data securely
      await SecureStore.setItemAsync('user_token', JSON.stringify({ userId: user.id }));
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      // Create user in local database
      await databaseService.createUser(user);
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false 
      });
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('user_token');
      await AsyncStorage.removeItem('user_data');
      set({ user: null, isAuthenticated: false, error: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    
    try {
      const userToken = await SecureStore.getItemAsync('user_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (userToken && userData) {
        const user: User = JSON.parse(userData);
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Load stored auth error:', error);
      await get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
}));