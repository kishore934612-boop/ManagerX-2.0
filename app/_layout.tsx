import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { databaseService } from '../services/database';
import { lightTheme, darkTheme } from '../constants/theme';
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useFrameworkReady();
  
  const colorScheme = useColorScheme();
  const { loadStoredAuth } = useAuthStore();
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await databaseService.initialize();
        
        // Load settings and auth
        await Promise.all([
          loadSettings(),
          loadStoredAuth()
        ]);

        // Request notification permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permissions not granted');
        }
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  const getTheme = () => {
    if (settings.theme === 'system') {
      return colorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return settings.theme === 'dark' ? darkTheme : lightTheme;
  };

  return (
    <PaperProvider theme={getTheme()}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="task-form" options={{ presentation: 'modal' }} />
        <Stack.Screen name="note-editor" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}