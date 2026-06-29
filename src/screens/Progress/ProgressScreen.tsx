import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow, subMonths } from 'date-fns';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { MainTabScreenProps } from '../../navigation/types';
import { fetchExercises } from '../../database/helpers';
import type { Exercise } from '../../types/exercise';
import type { PersonalRecord } from '../../types/workout';
import { useExerciseHistory, usePersonalRecords } from '../../hooks';
import { ProgressChart, VolumeChart } from '../../components/charts';
import type { ProgressChartPoint, VolumeChartPoint } from '../../components/charts';
import { Badge, BottomSheet, Card, EmptyState, Input, LoadingSpinner } from '../../components/common';
import type { BottomSheetRef } from '../../components/common';
import { fromKg, formatWeight, roundWeight } from '../../utils/units';
import { calculateOneRepMax } from '../../utils/oneRepMax';
import { calculateTotalVolume } from '../../utils/volume';
import { useSettingsStore } from '../../store/settingsStore';

type Props = MainTabScreenProps<'Progress'>;

type Metric = 'weight' | 'volume' | 'oneRepMax';
type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'All';

const METRIC_OPTIONS: { key: Metric; label: string }[] = [
  { key: 'weight', label: 'Max Weight' },
  { key: 'volume', label: 'Volume' },
  { key: 'oneRepMax', label: 'Est. 1RM' },
];

const TIME_RANGE_OPTIONS: TimeRange[] = ['1M', '3M', '6M', '1Y', 'All'];

const RANGE_TO_MONTHS: Record<Exclude<TimeRange, 'All'>, number> = {
  '1M': 1,
  '3M': 3,
  '6M': 6,
  '1Y': 12,
};

export const ProgressScreen: React.FC<Props> = () => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const unit = useSettingsStore((state) => state.unit);
  const pickerRef = useRef<BottomSheetRef>(null);

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [pickerQuery, setPickerQuery] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>('weight');
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchExercises().then((data) => {
        if (!cancelled) setAllExercises(data);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const selectedExercise = useMemo(
    () => allExercises.find((exercise) => exercise.id === selectedExerciseId) ?? null,
    [allExercises, selectedExerciseId],
  );

  const { history, loading: historyLoading } = useExerciseHistory(selectedExerciseId ?? undefined);
  const { records, loading: recordsLoading } = usePersonalRecords(selectedExerciseId ?? undefined);

  const filteredHistory = useMemo(() => {
    if (timeRange === 'All') return history;
    const cutoff = subMonths(new Date(), RANGE_TO_MONTHS[timeRange]).getTime();
    return history.filter((entry) => entry.date >= cutoff);
  }, [history, timeRange]);

  const chartPoints = useMemo(() => {
    return [...filteredHistory]
      .reverse()
      .map((entry) => {
        const workingSets = entry.sets.filter((set) => !set.isWarmup);
        if (workingSets.length === 0) return null;

        let raw: number;
        if (metric === 'weight') {
          raw = Math.max(...workingSets.map((set) => set.weight));
        } else if (metric === 'volume') {
          raw = calculateTotalVolume(workingSets);
        } else {
          raw = Math.max(...workingSets.map((set) => calculateOneRepMax(set.weight, set.reps)));
        }

        return { date: entry.date, value: roundWeight(fromKg(raw, unit)) };
      })
      .filter((point): point is ProgressChartPoint => point !== null);
  }, [filteredHistory, metric, unit]);

  const volumePoints = useMemo<VolumeChartPoint[]>(
    () => chartPoints.map((point) => ({ date: point.date, volume: point.value })),
    [chartPoints],
  );

  const avgReps = useMemo(() => {
    const allSets = history.flatMap((entry) => entry.sets.filter((set) => !set.isWarmup));
    if (allSets.length === 0) return 0;
    return Math.round(allSets.reduce((sum, set) => sum + set.reps, 0) / allSets.length);
  }, [history]);

  const currentPr: PersonalRecord | null = useMemo(() => {
    if (metric === 'weight') return records.maxWeight;
    if (metric === 'volume') return records.maxVolume;
    return records.maxOneRepMax;
  }, [metric, records]);

  const filteredLibrary = useMemo(() => {
    const query = pickerQuery.trim().toLowerCase();
    if (!query) return allExercises;
    return allExercises.filter((exercise) => exercise.name.toLowerCase().includes(query));
  }, [allExercises, pickerQuery]);

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    setSelectedExerciseId(exercise.id);
    setPickerQuery('');
    pickerRef.current?.dismiss();
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Progress</Text>

        <Pressable style={styles.exerciseSelector} onPress={() => pickerRef.current?.present()}>
          <View style={styles.exerciseSelectorIcon}>
            <Icon name="dumbbell" size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.exerciseSelectorLabel} numberOfLines={1}>
            {selectedExercise ? selectedExercise.name : 'Select an exercise'}
          </Text>
          <Icon name="chevron-down" size={20} color={theme.colors.textMuted} />
        </Pressable>

        {!selectedExercise ? (
          <EmptyState
            icon="chart-line"
            title="No exercise selected"
            description="Choose an exercise to view its progress over time."
            actionLabel="Choose Exercise"
            onAction={() => pickerRef.current?.present()}
          />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {METRIC_OPTIONS.map((option) => (
                <Pressable key={option.key} onPress={() => setMetric(option.key)}>
                  <Badge label={option.label} variant={metric === option.key ? 'filled' : 'outline'} />
                </Pressable>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {TIME_RANGE_OPTIONS.map((option) => (
                <Pressable key={option} onPress={() => setTimeRange(option)}>
                  <Badge label={option} variant={timeRange === option ? 'filled' : 'outline'} />
                </Pressable>
              ))}
            </ScrollView>

            <Card style={styles.chartCard}>
              {historyLoading ? (
                <LoadingSpinner label="Loading history..." />
              ) : metric === 'volume' ? (
                <VolumeChart data={volumePoints} />
              ) : (
                <ProgressChart data={chartPoints} valueSuffix={` ${unit}`} />
              )}
            </Card>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.prCard]}>
                <Icon name="trophy-outline" size={18} color={theme.colors.pr} />
                <Text style={styles.statValue}>{currentPr ? formatWeight(currentPr.value, unit) : '—'}</Text>
                <Text style={styles.statLabel}>Current PR</Text>
                <Text style={styles.statSubLabel}>
                  {currentPr ? formatDistanceToNow(currentPr.achievedAt, { addSuffix: true }) : 'No data yet'}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{recordsLoading ? '—' : history.length}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{recordsLoading ? '—' : avgReps}</Text>
                <Text style={styles.statLabel}>Avg Reps</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <BottomSheet ref={pickerRef} title="Select Exercise">
        <Input
          placeholder="Search exercises"
          value={pickerQuery}
          onChangeText={setPickerQuery}
          autoCorrect={false}
          containerStyle={styles.pickerSearch}
        />
        <FlatList
          data={filteredLibrary}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState icon="magnify" title="No exercises found" description="Try a different search term." />
          }
          renderItem={({ item }) => (
            <Pressable style={styles.pickerRow} onPress={() => handleSelectExercise(item)}>
              <View style={styles.pickerInfo}>
                <Text style={styles.pickerName}>{item.name}</Text>
                <Text style={styles.pickerSubtitle}>
                  {item.muscleGroups.join(', ')} • {item.equipment}
                </Text>
              </View>
              {item.id === selectedExerciseId ? (
                <Icon name="check-circle" size={22} color={theme.colors.success} />
              ) : null}
            </Pressable>
          )}
        />
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
      paddingBottom: theme.spacing.xxxl,
    },
    title: {
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: theme.typography.fontWeight.heavy as '800',
      color: theme.colors.text,
      marginBottom: theme.spacing.base,
    },
    exerciseSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.base,
    },
    exerciseSelectorIcon: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryMuted,
    },
    exerciseSelectorLabel: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
    },
    chipsRow: {
      gap: theme.spacing.xs,
      paddingBottom: theme.spacing.sm,
    },
    chartCard: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.base,
    },
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.sm,
      alignItems: 'flex-start',
    },
    prCard: {
      borderColor: theme.colors.pr,
    },
    statValue: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
    },
    statLabel: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    statSubLabel: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    pickerSearch: {
      marginBottom: theme.spacing.sm,
    },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    pickerInfo: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    pickerName: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
    },
    pickerSubtitle: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
  });
