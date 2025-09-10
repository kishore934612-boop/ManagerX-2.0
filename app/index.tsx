import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { authenticateWithBiometric, settings } = useSettingsStore();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      if (!isLoading) {
        if (isAuthenticated) {
          // Check biometric authentication if enabled
          if (settings.biometricEnabled) {
            const authenticated = await authenticateWithBiometric();
            if (authenticated) {
              router.replace('/(tabs)');
            } else {
              router.replace('/auth/login');
            }
          } else {
            router.replace('/(tabs)');
          }
        } else {
          router.replace('/auth/login');
        }
      }
    };

    checkAuthAndNavigate();
  }, [isAuthenticated, isLoading, settings.biometricEnabled]);

  return <LoadingSpinner />;
}