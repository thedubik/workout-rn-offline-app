import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { ActiveExercise, ActiveSet } from '../../types/workout';
import type { WeightUnit } from '../../types/settings';
import { Card } from '../common';
import { SetRow } from './SetRow';

interface ExerciseBlockProps {
  exercise: ActiveExercise;
  unit: WeightUnit;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, patch: Partial<Pick<ActiveSet, 'weight' | 'reps' | 'isWarmup'>>) => void;
  onToggleSetComplete: (setId: string) => void;
  onRemoveExercise: () => void;
  onPressName?: () => void;
  drag?: () => void;
  isActive?: boolean;
}

export const ExerciseBlock: React.FC<ExerciseBlockProps> = ({
  exercise,
  unit,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSetComplete,
  onRemoveExercise,
  onPressName,
  drag,
  isActive,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const completedCount = exercise.sets.filter((set) => set.isCompleted).length;

  return (
    <Card style={isActive ? styles.cardActive : undefined}>
      <View style={styles.header}>
        {drag ? (
          <Pressable onLongPress={drag} delayLongPress={100} hitSlop={8} style={styles.dragHandle}>
            <Icon name="drag-vertical" size={20} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}

        <Pressable style={styles.titleWrapper} onPress={onPressName} disabled={!onPressName}>
          <Text style={styles.title} numberOfLines={1}>
            {exercise.exerciseName}
          </Text>
          <Text style={styles.subtitle}>
            {completedCount}/{exercise.sets.length} sets
          </Text>
        </Pressable>

        <Pressable onPress={onRemoveExercise} hitSlop={8} style={styles.removeButton}>
          <Icon name="close" size={18} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.columnHeader}>
        <Text style={[styles.columnLabel, styles.setColumn]}>SET</Text>
        <Text style={[styles.columnLabel, styles.previousColumn]}>PREVIOUS</Text>
        <Text style={[styles.columnLabel, styles.inputColumn]}>{unit.toUpperCase()}</Text>
        <Text style={[styles.columnLabel, styles.inputColumn]}>REPS</Text>
        <Icon name="check-bold" size={14} color={theme.colors.textMuted} style={styles.checkColumn} />
      </View>

      {exercise.sets.map((set) => (
        <SetRow
          key={set.id}
          set={set}
          unit={unit}
          onChangeWeight={(weightKg) => onUpdateSet(set.id, { weight: weightKg })}
          onChangeReps={(reps) => onUpdateSet(set.id, { reps })}
          onToggleComplete={() => onToggleSetComplete(set.id)}
          onToggleWarmup={() => onUpdateSet(set.id, { isWarmup: !set.isWarmup })}
          onRemove={() => onRemoveSet(set.id)}
        />
      ))}

      <Pressable style={styles.addSetButton} onPress={onAddSet}>
        <Icon name="plus" size={16} color={theme.colors.primary} />
        <Text style={styles.addSetLabel}>Add Set</Text>
      </Pressable>
    </Card>
  );
};

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    cardActive: {
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 6,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    dragHandle: {
      paddingRight: theme.spacing.xxs,
    },
    titleWrapper: {
      flex: 1,
    },
    title: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    removeButton: {
      width: 28,
      height: 28,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
    },
    columnHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    columnLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    setColumn: {
      width: 32,
    },
    previousColumn: {
      flex: 1.1,
      textAlign: 'left',
    },
    inputColumn: {
      flex: 1,
    },
    checkColumn: {
      width: 30,
      textAlign: 'center',
    },
    addSetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      marginTop: theme.spacing.xs,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
    },
    addSetLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.primary,
    },
  });
