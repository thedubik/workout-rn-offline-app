import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { trigger as triggerHaptic } from 'react-native-haptic-feedback';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { ActiveSet } from '../../types/workout';
import type { WeightUnit } from '../../types/settings';
import { fromKg, roundWeight, toKg } from '../../utils/units';

interface SetRowProps {
  set: ActiveSet;
  unit: WeightUnit;
  onChangeWeight: (weightKg: number) => void;
  onChangeReps: (reps: number) => void;
  onToggleComplete: () => void;
  onToggleWarmup?: () => void;
  onRemove?: () => void;
}

const formatNumber = (value: number): string =>
  Number.isInteger(value) ? String(value) : String(value.toFixed(1));

export const SetRow: React.FC<SetRowProps> = ({
  set,
  unit,
  onChangeWeight,
  onChangeReps,
  onToggleComplete,
  onToggleWarmup,
  onRemove,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const checkScale = useSharedValue(1);

  const [weightText, setWeightText] = useState(() =>
    set.weight > 0 ? formatNumber(roundWeight(fromKg(set.weight, unit))) : '',
  );
  const [repsText, setRepsText] = useState(() => (set.reps > 0 ? String(set.reps) : ''));

  useEffect(() => {
    setWeightText(set.weight > 0 ? formatNumber(roundWeight(fromKg(set.weight, unit))) : '');
  }, [set.weight, unit]);

  useEffect(() => {
    setRepsText(set.reps > 0 ? String(set.reps) : '');
  }, [set.reps]);

  const handleWeightChange = (text: string) => {
    setWeightText(text);
    const parsed = parseFloat(text.replace(',', '.'));
    onChangeWeight(Number.isFinite(parsed) ? toKg(parsed, unit) : 0);
  };

  const handleRepsChange = (text: string) => {
    setRepsText(text);
    const parsed = parseInt(text, 10);
    onChangeReps(Number.isFinite(parsed) ? parsed : 0);
  };

  const handleToggleComplete = () => {
    checkScale.value = withSpring(1.25, { damping: 8, stiffness: 350 }, (finished) => {
      'worklet';

      if (finished) checkScale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });
    triggerHaptic(set.isCompleted ? 'impactLight' : 'notificationSuccess');
    onToggleComplete();
  };

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    backgroundColor: withTiming(set.isCompleted ? theme.colors.success : 'transparent', {
      duration: 150,
    }),
    borderColor: withTiming(set.isCompleted ? theme.colors.success : theme.colors.border, {
      duration: 150,
    }),
  }));

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(set.isCompleted ? `${theme.colors.success}1A` : 'transparent', {
      duration: 150,
    }),
  }));

  const previousLabel = set.previous
    ? `${formatNumber(roundWeight(fromKg(set.previous.weight, unit)))} × ${set.previous.reps}`
    : '—';

  return (
    <Animated.View style={[styles.row, rowAnimatedStyle]}>
      <Pressable style={styles.setBadge} onPress={onToggleWarmup} onLongPress={onRemove} hitSlop={8}>
        {set.isWarmup ? (
          <Icon name="fire" size={16} color={theme.colors.warmup} />
        ) : (
          <Text style={styles.setNumber}>{set.setNumber}</Text>
        )}
      </Pressable>

      <View style={styles.previousCell}>
        <Text style={styles.previous} numberOfLines={1}>
          {previousLabel}
        </Text>
      </View>

      <TextInput
        style={[styles.input, styles.weightInput]}
        value={weightText}
        onChangeText={handleWeightChange}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={theme.colors.textMuted}
        selectTextOnFocus
      />

      <TextInput
        style={[styles.input, styles.repsInput]}
        value={repsText}
        onChangeText={handleRepsChange}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={theme.colors.textMuted}
        selectTextOnFocus
      />

      <Pressable onPress={handleToggleComplete} hitSlop={8}>
        <Animated.View style={[styles.checkbox, checkAnimatedStyle]}>
          {set.isCompleted ? <Icon name="check-bold" size={14} color={theme.colors.onPrimary} /> : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.radius.md,
    },
    setBadge: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
    },
    setNumber: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.textSecondary,
    },
    previousCell: {
      flex: 1.1,
    },
    previous: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    input: {
      flex: 1,
      height: 38,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
      paddingVertical: 0,
    },
    weightInput: {},
    repsInput: {},
    checkbox: {
      width: 30,
      height: 30,
      borderRadius: theme.radius.sm,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
