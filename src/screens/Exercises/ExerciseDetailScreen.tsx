import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, formatDistanceToNow } from 'date-fns';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { RootStackScreenProps } from '../../navigation/types';
import { deleteExercise, fetchExerciseById } from '../../database/helpers';
import type { Exercise } from '../../types/exercise';
import type { PersonalRecord } from '../../types/workout';
import { useExerciseHistory, usePersonalRecords } from '../../hooks';
import { ProgressChart } from '../../components/charts';
import type { ProgressChartPoint } from '../../components/charts';
import { Badge, Card, EmptyState, LoadingSpinner } from '../../components/common';
import { fromKg, formatWeight, roundWeight } from '../../utils/units';
import { muscleGroupColors } from '../../utils/muscleGroups';
import { useSettingsStore } from '../../store/settingsStore';

type Props = RootStackScreenProps<'ExerciseDetail'>;

export const ExerciseDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { exerciseId } = route.params;
  const unit = useSettingsStore((state) => state.unit);

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loadingExercise, setLoadingExercise] = useState(true);

  const { history, loading: historyLoading } = useExerciseHistory(exerciseId);
  const { records, loading: recordsLoading } = usePersonalRecords(exerciseId);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoadingExercise(true);
      fetchExerciseById(exerciseId).then((result) => {
        if (!cancelled) {
          setExercise(result);
          setLoadingExercise(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [exerciseId]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: exercise?.name ?? 'Exercise' });
  }, [navigation, exercise]);

  const chartData = useMemo<ProgressChartPoint[]>(() => {
    return [...history]
      .reverse()
      .map((entry) => {
        const workingSets = entry.sets.filter((set) => !set.isWarmup);
        if (workingSets.length === 0) return null;
        const maxWeight = Math.max(...workingSets.map((set) => set.weight));
        return { date: entry.date, value: roundWeight(fromKg(maxWeight, unit)) };
      })
      .filter((point): point is ProgressChartPoint => point !== null);
  }, [history, unit]);

  const handleEdit = useCallback(() => {
    navigation.navigate('CreateExercise', { exerciseId });
  }, [navigation, exerciseId]);

  const handleDelete = useCallback(() => {
    if (!exercise) return;
    Alert.alert('Delete Exercise', `Delete "${exercise.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteExercise(exercise.id);
          navigation.goBack();
        },
      },
    ]);
  }, [exercise, navigation]);

  const renderStat = (label: string, record: PersonalRecord | null, formatValue: (value: number) => string) => (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{record ? formatValue(record.value) : '—'}</Text>
      <Text style={styles.statSubLabel}>
        {record ? formatDistanceToNow(record.achievedAt, { addSuffix: true }) : 'No data yet'}
      </Text>
    </View>
  );

  if (loadingExercise || recordsLoading || historyLoading) {
    return <LoadingSpinner fullScreen label="Loading exercise..." />;
  }

  if (!exercise) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Exercise not found"
        description="This exercise may have been deleted."
      />
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card style={styles.headerCard}>
        <Text style={styles.name}>{exercise.name}</Text>
        <View style={styles.badgesRow}>
          {exercise.muscleGroups.map((group) => (
            <Badge key={group} label={group} color={muscleGroupColors[group]} />
          ))}
          <Badge label={exercise.equipment} variant="outline" />
          <Badge label={exercise.type} variant="outline" />
          {exercise.isCustom ? <Badge label="Custom" color={theme.colors.secondary} /> : null}
        </View>
        {exercise.notes ? <Text style={styles.notes}>{exercise.notes}</Text> : null}

        {exercise.isCustom ? (
          <View style={styles.actionsRow}>
            <Pressable style={styles.actionButton} onPress={handleEdit}>
              <Icon name="pencil-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.actionLabel}>Edit</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleDelete}>
              <Icon name="trash-can-outline" size={16} color={theme.colors.error} />
              <Text style={[styles.actionLabel, { color: theme.colors.error }]}>Delete</Text>
            </Pressable>
          </View>
        ) : null}
      </Card>

      <Text style={styles.sectionTitle}>Personal Records</Text>
      <View style={styles.statsGrid}>
        {renderStat('Max Weight', records.maxWeight, (value) => formatWeight(value, unit))}
        {renderStat('Est. 1RM', records.maxOneRepMax, (value) => formatWeight(value, unit))}
        {renderStat('Max Volume', records.maxVolume, (value) => formatWeight(value, unit))}
        {renderStat('Max Reps', records.maxReps, (value) => `${value} reps`)}
      </View>

      <Text style={styles.sectionTitle}>Progress</Text>
      <Card style={styles.chartCard}>
        <ProgressChart data={chartData} valueSuffix={` ${unit}`} />
      </Card>

      <Text style={styles.sectionTitle}>Recent Sessions</Text>
      {history.length === 0 ? (
        <EmptyState
          icon="history"
          title="No history yet"
          description="Log this exercise in a workout to see your history."
        />
      ) : (
        history.slice(0, 5).map((entry) => (
          <Card key={entry.sessionId} style={styles.historyCard}>
            <Text style={styles.historyDate}>{format(entry.date, 'MMM d, yyyy')}</Text>
            {entry.sets.map((set) => (
              <Text key={set.setNumber} style={styles.historySetText}>
                Set {set.setNumber}: {formatWeight(set.weight, unit)} × {set.reps}
                {set.isWarmup ? ' (warm-up)' : ''}
              </Text>
            ))}
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.base,
      paddingBottom: theme.spacing.xxxl,
    },
    headerCard: {
      marginBottom: theme.spacing.lg,
    },
    name: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.heavy as '800',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    badgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    notes: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.lineHeight.base,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    actionLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.primary,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    statCard: {
      flexBasis: '47%',
      flexGrow: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.base,
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.xxs,
    },
    statValue: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
    },
    statSubLabel: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    chartCard: {
      marginBottom: theme.spacing.lg,
    },
    historyCard: {
      marginBottom: theme.spacing.sm,
    },
    historyDate: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    historySetText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
  });
