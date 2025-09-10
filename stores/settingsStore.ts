import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppSettings } from '../types/database';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  clearError: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  biometricEnabled: false,
  notificationsEnabled: true,
  autoSaveInterval: 3000, // 3 seconds
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const storedSettings = await AsyncStorage.getItem('app_settings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        set({ settings: { ...defaultSettings, ...settings } });
      }
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load settings',
        isLoading: false 
      });
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const { settings } = get();
      const updatedSettings = { ...settings, ...newSettings };
      
      await AsyncStorage.setItem('app_settings', JSON.stringify(updatedSettings));
      set({ settings: updatedSettings });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update settings'
      });
    }
  },

  enableBiometric: async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware) {
        set({ error: 'Biometric hardware not available' });
        return false;
      }
      
      if (!isEnrolled) {
        set({ error: 'No biometric data enrolled' });
        return false;
      }
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric authentication',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        await get().updateSettings({ biometricEnabled: true });
        return true;
      } else {
        set({ error: 'Biometric authentication failed' });
        return false;
      }
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to enable biometric'
      });
      return false;
    }
  },

  disableBiometric: async () => {
    try {
      await get().updateSettings({ biometricEnabled: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to disable biometric'
      });
    }
  },

  authenticateWithBiometric: async () => {
    try {
      const { settings } = get();
      if (!settings.biometricEnabled) return true;
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Managex',
        disableDeviceFallback: false,
      });
      
      return result.success;
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Biometric authentication failed'
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));