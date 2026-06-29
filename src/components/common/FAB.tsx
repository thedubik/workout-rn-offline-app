import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';

interface FABProps {
  icon?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({ icon = 'plus', onPress, style }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      right: theme.spacing.lg,
      bottom: theme.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 6,
    },
    pressed: {
      opacity: 0.85,
    },
  });

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed, style]}
    >
      <Icon name={icon} size={26} color={theme.colors.onPrimary} />
    </Pressable>
  );
};
