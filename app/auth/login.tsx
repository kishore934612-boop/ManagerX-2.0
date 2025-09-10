import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  useTheme,
  HelperText
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { LogIn, Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const theme = useTheme();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const { authenticateWithBiometric, settings } = useSettingsStore();
  
  const [email, setEmail] = useState('demo@managex.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const checkBiometric = async () => {
      if (settings.biometricEnabled && isAuthenticated) {
        const authenticated = await authenticateWithBiometric();
        if (authenticated) {
          router.replace('/(tabs)');
        }
      }
    };
    checkBiometric();
  }, [settings.biometricEnabled, isAuthenticated]);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }
    
    clearError();
    try {
      await login(email, password);
      // Navigation will be handled by useEffect
    } catch (err) {
      // Error is handled by the store
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <LogIn size={48} color={theme.colors.primary} />
            <Text variant="headlineLarge" style={styles.title}>
              Welcome Back
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Sign in to your Managex account
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              left={<TextInput.Icon icon={() => <Mail size={20} color={theme.colors.outline} />} />}
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              left={<TextInput.Icon icon={() => <Lock size={20} color={theme.colors.outline} />} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            {error && (
              <HelperText type="error" style={styles.error}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
              loading={isLoading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>

            <View style={styles.footer}>
              <Text variant="bodyMedium" style={styles.footerText}>
                Don't have an account?{' '}
              </Text>
              <Button
                mode="text"
                onPress={() => router.push('/auth/register')}
                compact
              >
                Sign Up
              </Button>
            </View>

            <View style={styles.demoContainer}>
              <Text variant="bodySmall" style={styles.demoText}>
                Demo credentials are pre-filled for testing
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  error: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  footerText: {
    opacity: 0.7,
  },
  demoContainer: {
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  demoText: {
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
});