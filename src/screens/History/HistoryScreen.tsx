import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, isSameDay } from 'date-fns';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { MainTabScreenProps } from '../../navigation/types';
import { fetchSessions } from '../../database/helpers';
import type { WorkoutSession } from '../../types/workout';
import type { WeightUnit } from '../../types/settings';
import { WorkoutCalendar } from '../../components/calendar';
import { Card, EmptyState, LoadingSpinner } from '../../components/common';
import { formatDurationWords } from '../../utils/formatDuration';
import { formatWeight } from '../../utils/units';
import { useSettingsStore } from '../../store/settingsStore';

type Props = MainTabScreenProps<'History'>;

interface SessionListItemProps {
  session: WorkoutSession;
  unit: WeightUnit;
  expanded: boolean;
  onToggle: () => void;
}

const SessionListItem: React.FC<SessionListItemProps> = ({ session, unit, expanded, onToggle }) => {
  const theme = useTheme();
  const styles = useItemStyles(theme);
  const totalSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);

  return (
    <Card style={styles.card}>
      <Pressable onPress={onToggle} style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {session.name}
          </Text>
          <Text style={styles.date}>{format(session.startedAt, 'EEEE, MMM d, yyyy')}</Text>
        </View>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={theme.colors.textMuted} />
      </Pressable>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Icon name="clock-outline" size={14} color={theme.colors.textMuted} />
          <Text style={styles.statText}>{formatDurationWords(session.duration)}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="weight-kilogram" size={14} color={theme.colors.textMuted} />
          <Text style={styles.statText}>{formatWeight(session.totalVolume, unit)}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="format-list-numbered" size={14} color={theme.colors.textMuted} />
          <Text style={styles.statText}>{totalSets} sets</Text>
        </View>
      </View>

      {expanded ? (
        <View style={styles.exercisesList}>
          {session.exercises.map((exercise) => (
            <View key={exercise.exerciseId} style={styles.exerciseBlock}>
              <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
              {exercise.sets.map((set) => (
                <Text key={set.setNumber} style={styles.setText}>
                  Set {set.setNumber}: {formatWeight(set.weight, unit)} × {set.reps}
                  {set.isWarmup ? ' (warm-up)' : ''}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
};

export const HistoryScreen: React.FC<Props> = () => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const unit = useSettingsStore((state) => state.unit);

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      fetchSessions().then((data) => {
        if (!cancelled) {
          setSessions(data);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const markedDates = useMemo(
    () => new Set(sessions.map((session) => format(session.startedAt, 'yyyy-MM-dd'))),
    [sessions],
  );

  const filteredSessions = useMemo(() => {
    if (!selectedDate) return sessions;
    return sessions.filter((session) => isSameDay(session.startedAt, selectedDate));
  }, [sessions, selectedDate]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate((current) => (current && isSameDay(current, date) ? null : date));
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading history..." />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>History</Text>

        <Card style={styles.calendarCard}>
          <WorkoutCalendar markedDates={markedDates} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'All Workouts'}
          </Text>
          {selectedDate ? (
            <Pressable onPress={() => setSelectedDate(null)} hitSlop={8}>
              <Text style={styles.clearLink}>Clear</Text>
            </Pressable>
          ) : null}
        </View>

        {filteredSessions.length === 0 ? (
          <EmptyState
            icon="calendar-blank-outline"
            title="No workouts found"
            description={selectedDate ? 'No workouts logged on this day.' : 'Finish a workout to see it here.'}
          />
        ) : (
          filteredSessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              unit={unit}
              expanded={expandedId === session.id}
              onToggle={() => setExpandedId((current) => (current === session.id ? null : session.id))}
            />
          ))
        )}
      </ScrollView>
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
    },
    title: {
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: theme.typography.fontWeight.heavy as '800',
      color: theme.colors.text,
      marginBottom: theme.spacing.base,
    },
    calendarCard: {
      marginBottom: theme.spacing.base,
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
    clearLink: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.primary,
    },
  });

const useItemStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerInfo: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    name: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
    },
    date: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.base,
      marginTop: theme.spacing.sm,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    statText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    exercisesList: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    exerciseBlock: {
      marginBottom: theme.spacing.sm,
    },
    exerciseName: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    setText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
  });
