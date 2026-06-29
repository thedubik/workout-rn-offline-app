import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';

interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label,
  fullScreen = false,
  size = 'large',
}) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
      ...(fullScreen ? { flex: 1, backgroundColor: theme.colors.background } : null),
    },
    label: {
      marginTop: theme.spacing.sm,
      color: theme.colors.textSecondary,
      fontSize: theme.typography.fontSize.sm,
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
};
