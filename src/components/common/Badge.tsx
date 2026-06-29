import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';

export type BadgeVariant = 'filled' | 'subtle' | 'outline';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  color?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  variant = 'subtle',
  size = 'sm',
  icon,
}) => {
  const theme = useTheme();
  const accent = color ?? theme.colors.primary;

  const backgroundColor = {
    filled: accent,
    subtle: `${accent}26`,
    outline: 'transparent',
  }[variant];

  const textColor = variant === 'filled' ? theme.colors.onPrimary : accent;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 4,
      backgroundColor,
      borderRadius: theme.radius.pill,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: accent,
      paddingHorizontal: size === 'sm' ? 8 : 12,
      paddingVertical: size === 'sm' ? 3 : 5,
    },
    label: {
      color: textColor,
      fontSize: size === 'sm' ? theme.typography.fontSize.xs : theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
    },
  });

  return (
    <View style={styles.container}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 12 : 14} color={textColor} /> : null}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};
