import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  padding?: number;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style, padding }) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    base: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: padding ?? theme.spacing.base,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pressed: {
      opacity: 0.85,
    },
  });

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.base, style, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, style]}>{children}</View>;
};
