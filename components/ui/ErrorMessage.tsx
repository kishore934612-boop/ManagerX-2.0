import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  showIcon?: boolean;
}

export function ErrorMessage({ message, onRetry, showIcon = true }: ErrorMessageProps) {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      {showIcon && (
        <AlertTriangle 
          size={48} 
          color={theme.colors.error} 
          style={styles.icon}
        />
      )}
      <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.error }]}>
        {message}
      </Text>
      {onRetry && (
        <Button
          mode="contained"
          onPress={onRetry}
          style={styles.button}
        >
          Try Again
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    minWidth: 120,
  },
});