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
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { UserPlus, Mail, Lock, User } from 'lucide-react-native';

export default function RegisterScreen() {
  const theme = useTheme();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleRegister = async () => {
    if (!isFormValid) {
      return;
    }
    
    clearError();
    try {
      await register(email, password, displayName || undefined);
      // Navigation will be handled by useEffect
    } catch (err) {
      // Error is handled by the store
    }
  };

  const isFormValid = 
    email.length > 0 && 
    password.length >= 6 && 
    confirmPassword === password;

  const passwordMismatch = confirmPassword.length > 0 && confirmPassword !== password;

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
            <UserPlus size={48} color={theme.colors.primary} />
            <Text variant="headlineLarge" style={styles.title}>
              Create Account
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Join Managex to organize your tasks and notes
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Display Name (Optional)"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoComplete="name"
              left={<TextInput.Icon icon={() => <User size={20} color={theme.colors.outline} />} />}
              style={styles.input}
            />

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
              autoComplete="new-password"
              left={<TextInput.Icon icon={() => <Lock size={20} color={theme.colors.outline} />} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            <HelperText type="info" style={styles.helperText}>
              Password must be at least 6 characters
            </HelperText>

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              left={<TextInput.Icon icon={() => <Lock size={20} color={theme.colors.outline} />} />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              style={styles.input}
              error={passwordMismatch}
            />

            {passwordMismatch && (
              <HelperText type="error" style={styles.error}>
                Passwords don't match
              </HelperText>
            )}

            {error && (
              <HelperText type="error" style={styles.error}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              disabled={!isFormValid || isLoading}
              loading={isLoading}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
            >
              Create Account
            </Button>

            <View style={styles.footer}>
              <Text variant="bodyMedium" style={styles.footerText}>
                Already have an account?{' '}
              </Text>
              <Button
                mode="text"
                onPress={() => router.push('/auth/login')}
                compact
              >
                Sign In
              </Button>
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
    marginBottom: 8,
  },
  helperText: {
    marginBottom: 8,
  },
  error: {
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    opacity: 0.7,
  },
});