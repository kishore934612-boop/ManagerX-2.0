import { MD3Theme } from 'react-native-paper';

export const lightTheme: MD3Theme = {
  colors: {
    primary: '#10b981', // Emerald
    onPrimary: '#ffffff',
    primaryContainer: '#a7f3d0',
    onPrimaryContainer: '#064e3b',
    secondary: '#6b7280',
    onSecondary: '#ffffff',
    secondaryContainer: '#e5e7eb',
    onSecondaryContainer: '#1f2937',
    tertiary: '#8b5cf6',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ddd6fe',
    onTertiaryContainer: '#4c1d95',
    error: '#ef4444',
    onError: '#ffffff',
    errorContainer: '#fecaca',
    onErrorContainer: '#991b1b',
    background: '#ffffff',
    onBackground: '#1f2937',
    surface: '#ffffff',
    onSurface: '#1f2937',
    surfaceVariant: '#f3f4f6',
    onSurfaceVariant: '#6b7280',
    outline: '#d1d5db',
    outlineVariant: '#e5e7eb',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#1f2937',
    inverseOnSurface: '#f9fafb',
    inversePrimary: '#34d399',
    elevation: {
      level0: '#ffffff',
      level1: '#f9fafb',
      level2: '#f3f4f6',
      level3: '#e5e7eb',
      level4: '#d1d5db',
      level5: '#9ca3af',
    },
    surfaceDisabled: '#f3f4f6',
    onSurfaceDisabled: '#9ca3af',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
  fonts: {
    default: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    displayLarge: {
      fontFamily: 'System',
      fontWeight: '700',
      fontSize: 32,
      lineHeight: 40,
    },
    displayMedium: {
      fontFamily: 'System',
      fontWeight: '700',
      fontSize: 28,
      lineHeight: 36,
    },
    displaySmall: {
      fontFamily: 'System',
      fontWeight: '600',
      fontSize: 24,
      lineHeight: 32,
    },
    headlineLarge: {
      fontFamily: 'System',
      fontWeight: '600',
      fontSize: 24,
      lineHeight: 32,
    },
    headlineMedium: {
      fontFamily: 'System',
      fontWeight: '600',
      fontSize: 20,
      lineHeight: 28,
    },
    headlineSmall: {
      fontFamily: 'System',
      fontWeight: '600',
      fontSize: 18,
      lineHeight: 24,
    },
    titleLarge: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 18,
      lineHeight: 24,
    },
    titleMedium: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 16,
      lineHeight: 22,
    },
    titleSmall: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 14,
      lineHeight: 20,
    },
    bodyLarge: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 24,
    },
    bodyMedium: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 14,
      lineHeight: 21,
    },
    bodySmall: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 12,
      lineHeight: 18,
    },
    labelLarge: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 14,
      lineHeight: 20,
    },
    labelMedium: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 12,
      lineHeight: 16,
    },
    labelSmall: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 10,
      lineHeight: 14,
    },
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

export const darkTheme: MD3Theme = {
  ...lightTheme,
  colors: {
    primary: '#34d399', // Emerald light
    onPrimary: '#064e3b',
    primaryContainer: '#065f46',
    onPrimaryContainer: '#a7f3d0',
    secondary: '#9ca3af',
    onSecondary: '#1f2937',
    secondaryContainer: '#4b5563',
    onSecondaryContainer: '#e5e7eb',
    tertiary: '#a78bfa',
    onTertiary: '#4c1d95',
    tertiaryContainer: '#6d28d9',
    onTertiaryContainer: '#ddd6fe',
    error: '#f87171',
    onError: '#7f1d1d',
    errorContainer: '#991b1b',
    onErrorContainer: '#fecaca',
    background: '#111827',
    onBackground: '#f9fafb',
    surface: '#1f2937',
    onSurface: '#f9fafb',
    surfaceVariant: '#374151',
    onSurfaceVariant: '#d1d5db',
    outline: '#6b7280',
    outlineVariant: '#4b5563',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#f9fafb',
    inverseOnSurface: '#1f2937',
    inversePrimary: '#10b981',
    elevation: {
      level0: '#111827',
      level1: '#1f2937',
      level2: '#374151',
      level3: '#4b5563',
      level4: '#6b7280',
      level5: '#9ca3af',
    },
    surfaceDisabled: '#374151',
    onSurfaceDisabled: '#6b7280',
    backdrop: 'rgba(0, 0, 0, 0.6)',
  },
};

export const priorityColors = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

export const noteColors = [
  '#ffffff', // White
  '#fef3c7', // Yellow
  '#fce7f3', // Pink
  '#dbeafe', // Blue
  '#d1fae5', // Green
  '#f3e8ff', // Purple
  '#fed7d7', // Red
  '#e0f2fe', // Cyan
];