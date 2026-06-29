import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { RootStackScreenProps } from '../../navigation/types';
import { useWorkoutStore } from '../../store/workoutStore';
import { useSettingsStore } from '../../store/settingsStore';
import { createSession, fetchExerciseHistory, markTemplatePerformed } from '../../database/helpers';
import { computePersonalRecords } from '../../hooks';
import { calculateOneRepMax } from '../../utils/oneRepMax';
import { calculateTotalVolume } from '../../utils/volume';
import { formatDurationWords } from '../../utils/formatDuration';
import { formatWeight } from '../../utils/units';
import { Button, Card, EmptyState } from '../../components/common';

type Props = RootStackScreenProps<'WorkoutSummary'>;

type AchievedPRType = 'weight' | 'oneRepMax' | 'volume';

interface AchievedPR {
  type: AchievedPRType;
  value: number;
}

const PR_LABELS: Record<AchievedPRType, string> = {
  weight: 'Heaviest set',
  oneRepMax: 'Estimated 1RM',
  volume: 'Session volume',
};

export const WorkoutSummaryScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const unit = useSettingsStore((state) => state.unit);
  const session = useWorkoutStore((state) => state.lastSession);

  const [prMap, setPrMap] = useState<Record<string, AchievedPR[]>>({});
  const [prLoading, setPrLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false, gestureEnabled: false });
  }, [navigation]);

  useEffect(() => {
    if (!session) {
      setPrLoading(false);
      return undefined;
    }

    let cancelled = false;

    Promise.all(
      session.exercises.map(async (exercise) => {
        const workingSets = exercise.sets.filter((set) => !set.isWarmup);
        if (workingSets.length === 0) return [exercise.exerciseId, []] as const;

        const priorHistory = await fetchExerciseHistory(exercise.exerciseId);
        const priorRecords = computePersonalRecords(priorHistory, exercise.exerciseId);
        const achieved: AchievedPR[] = [];

        const maxWeight = Math.max(...workingSets.map((set) => set.weight));
        if (!priorRecords.maxWeight || maxWeight > priorRecords.maxWeight.value) {
          achieved.push({ type: 'weight', value: maxWeight });
        }

        const maxOneRepMax = Math.max(...workingSets.map((set) => calculateOneRepMax(set.weight, set.reps)));
        if (!priorRecords.maxOneRepMax || maxOneRepMax > priorRecords.maxOneRepMax.value) {
          achieved.push({ type: 'oneRepMax', value: maxOneRepMax });
        }

        const sessionVolume = calculateTotalVolume(workingSets);
        if (!priorRecords.maxVolume || sessionVolume > priorRecords.maxVolume.value) {
          achieved.push({ type: 'volume', value: sessionVolume });
        }

        return [exercise.exerciseId, achieved] as const;
      }),
    ).then((entries) => {
      if (cancelled) return;
      setPrMap(Object.fromEntries(entries.filter(([, achieved]) => achieved.length > 0)));
      setPrLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const totalSets = useMemo(
    () => session?.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0) ?? 0,
    [session],
  );

  const goToDashboard = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }, [navigation]);

  const handleSave = useCallback(async () => {
    if (!session) return;
    setSaving(true);
    await createSession(session);
    if (session.templateId) {
      await markTemplatePerformed(session.templateId, session.finishedAt);
    }
    useWorkoutStore.getState().reset();
    goToDashboard();
  }, [session, goToDashboard]);

  const handleDiscard = useCallback(() => {
    Alert.alert('Discard Workout?', 'This workout will not be saved.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          useWorkoutStore.getState().reset();
          goToDashboard();
        },
      },
    ]);
  }, [goToDashboard]);

  if (!session) {
    return (
      <View style={styles.screen}>
        <EmptyState
          icon="alert-circle-outline"
          title="No workout to summarize"
          actionLabel="Back to Dashboard"
          onAction={goToDashboard}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <Icon name="trophy" size={36} color={theme.colors.pr} />
        </View>
        <Text style={styles.title}>Workout Complete!</Text>
        <Text style={styles.subtitle}>{session.name}</Text>
        <Text style={styles.date}>{format(session.startedAt, 'EEEE, MMM d, yyyy')}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="clock-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.statValue}>{formatDurationWords(session.duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="weight-kilogram" size={20} color={theme.colors.primary} />
            <Text style={styles.statValue}>{formatWeight(session.totalVolume, unit)}</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="format-list-numbered" size={20} color={theme.colors.primary} />
            <Text style={styles.statValue}>{totalSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
        </View>

        {!prLoading && Object.keys(prMap).length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Personal Records</Text>
            {session.exercises.map((exercise) =>
              (prMap[exercise.exerciseId] ?? []).map((pr) => (
                <Card key={`${exercise.exerciseId}-${pr.type}`} style={styles.prCard}>
                  <Icon name="trophy-outline" size={20} color={theme.colors.pr} />
                  <View style={styles.prInfo}>
                    <Text style={styles.prExercise}>{exercise.exerciseName}</Text>
                    <Text style={styles.prDetail}>
                      {PR_LABELS[pr.type]}: {formatWeight(pr.value, unit)}
                    </Text>
                  </View>
                </Card>
              )),
            )}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {session.exercises.map((exercise) => (
            <Card key={exercise.exerciseId} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
              {exercise.sets.map((set) => (
                <Text key={set.setNumber} style={styles.setText}>
                  Set {set.setNumber}: {formatWeight(set.weight, unit)} × {set.reps}
                  {set.isWarmup ? ' (warm-up)' : ''}
                </Text>
              ))}
            </Card>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Discard" variant="outline" onPress={handleDiscard} style={styles.discardButton} />
        <Button label="Save Workout" onPress={handleSave} loading={saving} style={styles.saveButton} />
      </View>
    </View>
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
      alignItems: 'center',
    },
    heroIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${theme.colors.pr}26`,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.base,
    },
    title: {
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: theme.typography.fontWeight.heavy as '800',
      color: theme.colors.text,
    },
    subtitle: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.textSecondary,
    },
    date: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    statsRow: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: theme.spacing.md,
    },
    statValue: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
    },
    statLabel: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    section: {
      alignSelf: 'stretch',
      marginTop: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    prCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      borderColor: theme.colors.pr,
    },
    prInfo: {
      flex: 1,
    },
    prExercise: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
    },
    prDetail: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    exerciseCard: {
      marginBottom: theme.spacing.sm,
    },
    exerciseName: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    setText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      padding: theme.spacing.base,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    discardButton: {
      flex: 1,
    },
    saveButton: {
      flex: 2,
    },
  });
