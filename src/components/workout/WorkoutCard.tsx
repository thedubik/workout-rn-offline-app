import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Swipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { WorkoutTemplate } from '../../types/workout';
import { Card } from '../common';

interface WorkoutCardProps {
  template: WorkoutTemplate;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ template, onPress, onEdit, onDelete }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const swipeableRef = useRef<SwipeableMethods>(null);

  const totalSets = template.exercises.reduce((sum, exercise) => sum + exercise.targetSets, 0);

  const renderRightActions = (_progress: SharedValue<number>, _translation: SharedValue<number>) => (
    <Pressable
      style={styles.deleteAction}
      onPress={() => {
        swipeableRef.current?.close();
        onDelete?.();
      }}
    >
      <Icon name="trash-can-outline" size={22} color={theme.colors.onPrimary} />
    </Pressable>
  );

  return (
    <View style={styles.wrapper}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={onDelete ? renderRightActions : undefined}
        overshootRight={false}
        friction={2}
      >
        <Card onPress={onPress}>
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Icon name="dumbbell" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.title} numberOfLines={1}>
                {template.name}
              </Text>
              <Text style={styles.subtitle}>
                {template.exercises.length} exercises • {totalSets} sets
              </Text>
            </View>
            {onEdit ? (
              <Pressable onPress={onEdit} hitSlop={8} style={styles.editButton}>
                <Icon name="pencil-outline" size={18} color={theme.colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.lastPerformed}>
            {template.lastPerformedAt
              ? `Last performed ${formatDistanceToNow(template.lastPerformedAt, { addSuffix: true })}`
              : 'Never performed'}
          </Text>
        </Card>
      </Swipeable>
    </View>
  );
};

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryMuted,
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
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    editButton: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
    },
    lastPerformed: {
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    deleteAction: {
      width: 72,
      marginLeft: theme.spacing.sm,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
