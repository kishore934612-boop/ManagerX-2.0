import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  List, 
  Switch, 
  Button,
  Snackbar,
  useTheme,
  RadioButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { 
  User, 
  Shield, 
  Palette, 
  Bell, 
  Download, 
  LogOut,
  Smartphone,
  Database
} from 'lucide-react-native';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const { 
    settings, 
    updateSettings, 
    enableBiometric, 
    disableBiometric,
    loadSettings,
    error,
    clearError
  } = useSettingsStore();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
      clearError();
    }
  }, [error]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await enableBiometric();
      if (success) {
        setSnackbarMessage('Biometric authentication enabled');
        setSnackbarVisible(true);
      }
    } else {
      await disableBiometric();
      setSnackbarMessage('Biometric authentication disabled');
      setSnackbarVisible(true);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Settings
          </Text>
          {user && (
            <Text variant="bodyMedium" style={styles.subtitle}>
              {user.displayName || user.email}
            </Text>
          )}
        </View>

        <Card style={styles.section}>
          <List.Section>
            <List.Subheader>Account</List.Subheader>
            <List.Item
              title="Profile"
              description="Manage your account information"
              left={() => <User size={24} color={theme.colors.primary} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                setSnackbarMessage('Profile settings coming soon!');
                setSnackbarVisible(true);
              }}
            />
          </List.Section>
        </Card>

        <Card style={styles.section}>
          <List.Section>
            <List.Subheader>Security</List.Subheader>
            <List.Item
              title="Biometric Authentication"
              description="Use fingerprint or face recognition to unlock the app"
              left={() => <Shield size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={settings.biometricEnabled}
                  onValueChange={handleBiometricToggle}
                />
              )}
            />
          </List.Section>
        </Card>

        <Card style={styles.section}>
          <List.Section>
            <List.Subheader>Appearance</List.Subheader>
            <List.Item
              title="Theme"
              description="Choose your preferred theme"
              left={() => <Palette size={24} color={theme.colors.primary} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                // Theme selection modal would open here
                setSnackbarMessage('Theme settings coming soon!');
                setSnackbarVisible(true);
              }}
            />
          </List.Section>
        </Card>

        <Card style={styles.section}>
          <List.Section>
            <List.Subheader>Notifications</List.Subheader>
            <List.Item
              title="Push Notifications"
              description="Receive reminders for your tasks"
              left={() => <Bell size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
                />
              )}
            />
          </List.Section>
        </Card>

        <Card style={styles.section}>
          <List.Section>
            <List.Subheader>Storage</List.Subheader>
            <List.Item
              title="Local Storage"
              description="All data is stored locally on your device"
              left={() => <Database size={24} color={theme.colors.primary} />}
            />
          </List.Section>
        </Card>

        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.logoutButton, { borderColor: theme.colors.error }]}
            textColor={theme.colors.error}
            icon={() => <LogOut size={18} color={theme.colors.error} />}
          >
            Sign Out
          </Button>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.version}>
            Managex v1.0.0
          </Text>
          <Text variant="bodySmall" style={styles.copyright}>
            Made with ❤️ for productivity
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  logoutContainer: {
    padding: 24,
    alignItems: 'center',
  },
  logoutButton: {
    minWidth: 200,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  version: {
    opacity: 0.7,
    marginBottom: 4,
  },
  copyright: {
    opacity: 0.5,
  },
  spacer: {
    height: 100,
  },
});