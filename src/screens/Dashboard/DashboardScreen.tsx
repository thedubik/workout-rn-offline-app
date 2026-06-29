import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { endOfWeek, format, isWithinInterval, startOfWeek, subDays } from 'date-fns';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { MainTabScreenProps } from '../../navigation/types';
import { fetchSessions, fetchTemplates } from '../../database/helpers';
import type { WorkoutSession, WorkoutTemplate } from '../../types/workout';
import { BottomSheet, Button, Card, EmptyState, LoadingSpinner } from '../../components/common';
import type { BottomSheetRef } from '../../components/common';
import { formatDurationWords } from '../../utils/formatDuration';
import { formatWeight } from '../../utils/units';
import { useSettingsStore } from '../../store/settingsStore';
import { startWorkoutFromTemplate } from '../../utils/startWorkout';

type Props = MainTabScreenProps<'Dashboard'>;

const WEEKLY_GOAL = 4;

/** Consecutive training days, counting back from today (or yesterday if nothing logged today). */
const computeStreak = (sessions: WorkoutSession[]): number => {
  if (sessions.length === 0) return 0;

  const trainingDays = new Set(sessions.map((session) => format(session.startedAt, 'yyyy-MM-dd')));

  let cursor = new Date();
  if (!trainingDays.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = subDays(cursor, 1);
  }

  let streak = 0;
  while (trainingDays.has(format(cursor, 'yyyy-MM-dd'))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
};

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const unit = useSettingsStore((state) => state.unit);
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [sessionsData, templatesData] = await Promise.all([fetchSessions(), fetchTemplates()]);
    setSessions(sessionsData);
    setTemplates(templatesData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      loadData().finally(() => {
        if (!cancelled) setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [loadData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const weekStats = useMemo(() => {
    const now = new Date();
    const interval = {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    };
    const weekSessions = sessions.filter((session) => isWithinInterval(session.startedAt, interval));

    return {
      workouts: weekSessions.length,
      totalVolume: weekSessions.reduce((sum, session) => sum + session.totalVolume, 0),
      totalDuration: weekSessions.reduce((sum, session) => sum + session.duration, 0),
    };
  }, [sessions]);

  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const recentSessions = useMemo(() => sessions.slice(0, 3), [sessions]);
  const weeklyProgress = Math.min(1, weekStats.workouts / WEEKLY_GOAL);

  const progressValue = useSharedValue(0);
  useEffect(() => {
    progressValue.value = withTiming(weeklyProgress, { duration: 600 });
  }, [weeklyProgress, progressValue]);
  const progressBarStyle = useAnimatedStyle(() => ({ width: `${progressValue.value * 100}%` }));

  const handleStartWorkout = useCallback(
    async (template: WorkoutTemplate | null) => {
      bottomSheetRef.current?.dismiss();
      await startWorkoutFromTemplate(template);
      navigation.navigate('ActiveWorkout', { templateId: template?.id });
    },
    [navigation],
  );

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading your dashboard..." />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{format(new Date(), 'EEEE, MMMM d')}</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <Pressable style={styles.settingsButton} onPress={() => navigation.navigate('Settings')} hitSlop={8}>
            <Icon name="cog-outline" size={22} color={theme.colors.text} />
          </Pressable>
        </View>

        <Card style={styles.weekCard}>
          <Text style={styles.cardTitle}>This Week</Text>

          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{weekStats.workouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{formatWeight(weekStats.totalVolume, unit)}</Text>
              <Text style={styles.statLabel}>Volume</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{formatDurationWords(weekStats.totalDuration)}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </View>
          <Text style={styles.progressLabel}>
            {weekStats.workouts >= WEEKLY_GOAL
              ? 'Goal smashed this week. Great work!'
              : `${weekStats.workouts}/${WEEKLY_GOAL} workouts toward your weekly goal`}
          </Text>

          <View style={styles.streakRow}>
            <Icon name="fire" size={18} color={streak > 0 ? theme.colors.secondary : theme.colors.textMuted} />
            <Text style={styles.streakLabel}>
              {streak > 0 ? `${streak} day streak` : 'Start your streak today'}
            </Text>
          </View>
        </Card>

        <Button
          label="Start Workout"
          icon={<Icon name="play-circle-outline" size={20} color={theme.colors.onPrimary} />}
          onPress={() => bottomSheetRef.current?.present()}
          fullWidth
          size="lg"
          style={styles.startButton}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <Pressable onPress={() => navigation.navigate('History')} hitSlop={8}>
            <Text style={styles.sectionLink}>See All</Text>
          </Pressable>
        </View>

        {recentSessions.length === 0 ? (
          <EmptyState
            icon="dumbbell"
            title="No workouts yet"
            description="Start your first workout to see it here."
          />
        ) : (
          recentSessions.map((session) => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionName} numberOfLines={1}>
                  {session.name}
                </Text>
                <Text style={styles.sessionDate}>{format(session.startedAt, 'MMM d')}</Text>
              </View>
              <View style={styles.sessionStatsRow}>
                <View style={styles.sessionStat}>
                  <Icon name="clock-outline" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.sessionStatLabel}>{formatDurationWords(session.duration)}</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Icon name="weight-kilogram" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.sessionStatLabel}>{formatWeight(session.totalVolume, unit)}</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Icon name="format-list-numbered" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.sessionStatLabel}>
                    {session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} sets
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <BottomSheet ref={bottomSheetRef} title="Start a Workout">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Pressable style={styles.startOption} onPress={() => handleStartWorkout(null)}>
            <View style={styles.startOptionIcon}>
              <Icon name="lightning-bolt-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.startOptionText}>
              <Text style={styles.startOptionTitle}>Empty Workout</Text>
              <Text style={styles.startOptionSubtitle}>Build it as you go</Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.textMuted} />
          </Pressable>

          {templates.length > 0 ? (
            <>
              <Text style={styles.sheetSectionLabel}>Your Templates</Text>
              {templates.map((template) => (
                <Pressable
                  key={template.id}
                  style={styles.startOption}
                  onPress={() => handleStartWorkout(template)}
                >
                  <View style={styles.startOptionIcon}>
                    <Icon name="dumbbell" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.startOptionText}>
                    <Text style={styles.startOptionTitle} numberOfLines={1}>
                      {template.name}
                    </Text>
                    <Text style={styles.startOptionSubtitle}>{template.exercises.length} exercises</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={theme.colors.textMuted} />
                </Pressable>
              ))}
            </>
          ) : null}
        </ScrollView>
      </BottomSheet>
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
      paddingBottom: theme.spacing.xxl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    greeting: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      marginBottom: 2,
    },
    title: {
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: theme.typography.fontWeight.heavy as '800',
      color: theme.colors.text,
    },
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    weekCard: {
      marginBottom: theme.spacing.base,
    },
    cardTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    statColumn: {
      flex: 1,
      alignItems: 'center',
    },
    statDivider: {
      width: StyleSheet.hairlineWidth,
      height: 32,
      backgroundColor: theme.colors.border,
    },
    statValue: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
    },
    statLabel: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    progressTrack: {
      height: 8,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.backgroundSecondary,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
    },
    progressLabel: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    streakRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    streakLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
    },
    startButton: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
    },
    sectionLink: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.primary,
    },
    sessionCard: {
      marginBottom: theme.spacing.sm,
    },
    sessionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    sessionName: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
      marginRight: theme.spacing.sm,
    },
    sessionDate: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    sessionStatsRow: {
      flexDirection: 'row',
      gap: theme.spacing.base,
    },
    sessionStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    sessionStatLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    startOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    startOptionIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryMuted,
    },
    startOptionText: {
      flex: 1,
    },
    startOptionTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
    },
    startOptionSubtitle: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      marginTop: 1,
    },
    sheetSectionLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
  });
