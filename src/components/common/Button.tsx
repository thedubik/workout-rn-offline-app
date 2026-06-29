import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  testID,
}) => {
  const theme = useTheme();
  const styles = useMemoStyles(theme);
  const isDisabled = disabled || loading;

  const variantStyle = variantStyles(theme)[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyle.container,
        variantStyle.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, sizeStyle.label, variantStyle.text]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; label: TextStyle }> = {
  sm: StyleSheet.create({
    container: { paddingVertical: 8, paddingHorizontal: 14 },
    label: { fontSize: 13 },
  }),
  md: StyleSheet.create({
    container: { paddingVertical: 13, paddingHorizontal: 20 },
    label: { fontSize: 15 },
  }),
  lg: StyleSheet.create({
    container: { paddingVertical: 16, paddingHorizontal: 24 },
    label: { fontSize: 17 },
  }),
};

const variantStyles = (theme: Theme) => ({
  primary: {
    container: { backgroundColor: theme.colors.primary },
    text: { color: theme.colors.onPrimary },
  },
  secondary: {
    container: { backgroundColor: theme.colors.secondary },
    text: { color: theme.colors.onPrimary },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    text: { color: theme.colors.primary },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: theme.colors.primary },
  },
  danger: {
    container: { backgroundColor: theme.colors.error },
    text: { color: theme.colors.onPrimary },
  },
});

const useMemoStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    label: {
      fontWeight: theme.typography.fontWeight.semibold as '600',
    },
    fullWidth: {
      width: '100%',
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.8,
    },
  });
