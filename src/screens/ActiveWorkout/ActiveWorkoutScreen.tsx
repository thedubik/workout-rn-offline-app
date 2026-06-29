import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableFlatList, { type RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { RootStackScreenProps } from '../../navigation/types';
import { useWorkoutStore } from '../../store/workoutStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useWorkoutTimer } from '../../hooks';
import { fetchExercises, fetchLastPerformance } from '../../database/helpers';
import type { Exercise } from '../../types/exercise';
import type { ActiveExercise } from '../../types/workout';
import { ExerciseBlock, RestTimer } from '../../components/workout';
import { BottomSheet, EmptyState, Input } from '../../components/common';
import type { BottomSheetRef } from '../../components/common';
import { formatDuration } from '../../utils/formatDuration';

type Props = RootStackScreenProps<'ActiveWorkout'>;

export const ActiveWorkoutScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const insets = useSafeAreaInsets();
  const templateId = route.params?.templateId;
  const addSheetRef = useRef<BottomSheetRef>(null);

  const name = useWorkoutStore((state) => state.name);
  const exercises = useWorkoutStore((state) => state.exercises);
  const restTimerActive = useWorkoutStore((state) => !!state.restTimer);
  const setName = useWorkoutStore((state) => state.setName);
  const addExercise = useWorkoutStore((state) => state.addExercise);
  const removeExercise = useWorkoutStore((state) => state.removeExercise);
  const reorderExercises = useWorkoutStore((state) => state.reorderExercises);
  const addSet = useWorkoutStore((state) => state.addSet);
  const removeSet = useWorkoutStore((state) => state.removeSet);
  const updateSet = useWorkoutStore((state) => state.updateSet);
  const toggleSetComplete = useWorkoutStore((state) => state.toggleSetComplete);
  const startRestTimer = useWorkoutStore((state) => state.startRestTimer);
  const finishWorkout = useWorkoutStore((state) => state.finishWorkout);
  const cancelWorkout = useWorkoutStore((state) => state.cancelWorkout);

  const unit = useSettingsStore((state) => state.unit);
  const restTimerDefault = useSettingsStore((state) => state.restTimerDefault);
  const elapsed = useWorkoutTimer();

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [pickerQuery, setPickerQuery] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (!useWorkoutStore.getState().isActive) {
      useWorkoutStore.getState().startWorkout({ templateId });
    }
  }, [templateId]);

  useEffect(() => {
    fetchExercises().then(setAllExercises);
  }, []);

  const addedExerciseIds = useMemo(() => new Set(exercises.map((ex) => ex.exerciseId)), [exercises]);

  const filteredLibrary = useMemo(() => {
    const query = pickerQuery.trim().toLowerCase();
    if (!query) return allExercises;
    return allExercises.filter((exercise) => exercise.name.toLowerCase().includes(query));
  }, [allExercises, pickerQuery]);

  const handleAddExercise = useCallback(
    async (exercise: Exercise) => {
      const previousSets = await fetchLastPerformance(exercise.id);
      addExercise(exercise, 3, previousSets);
      setPickerQuery('');
      addSheetRef.current?.dismiss();
    },
    [addExercise],
  );

  const handleToggleSetComplete = useCallback(
    (exercise: ActiveExercise, setId: string) => {
      const set = exercise.sets.find((s) => s.id === setId);
      toggleSetComplete(exercise.id, setId);
      if (set && !set.isCompleted && !set.isWarmup) {
        startRestTimer(restTimerDefault);
      }
    },
    [toggleSetComplete, startRestTimer, restTimerDefault],
  );

  const handleCancel = useCallback(() => {
    Alert.alert('Discard Workout?', 'Your progress will be lost.', [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          cancelWorkout();
          navigation.goBack();
        },
      },
    ]);
  }, [cancelWorkout, navigation]);

  const handleFinish = useCallback(() => {
    const completedSets = exercises.reduce(
      (sum, exercise) => sum + exercise.sets.filter((set) => set.isCompleted).length,
      0,
    );
    if (completedSets === 0) {
      Alert.alert('No sets logged', 'Complete at least one set before finishing.');
      return;
    }
    finishWorkout();
    navigation.replace('WorkoutSummary');
  }, [exercises, finishWorkout, navigation]);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<ActiveExercise>) => (
      <ScaleDecorator>
        <View style={styles.exerciseWrapper}>
          <ExerciseBlock
            exercise={item}
            unit={unit}
            drag={drag}
            isActive={isActive}
            onAddSet={() => addSet(item.id)}
            onRemoveSet={(setId) => removeSet(item.id, setId)}
            onUpdateSet={(setId, patch) => updateSet(item.id, setId, patch)}
            onToggleSetComplete={(setId) => handleToggleSetComplete(item, setId)}
            onRemoveExercise={() => removeExercise(item.id)}
          />
        </View>
      </ScaleDecorator>
    ),
    [styles, unit, addSet, removeSet, updateSet, removeExercise, handleToggleSetComplete],
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable onPress={handleCancel} hitSlop={8} style={styles.headerButton}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </Pressable>

        <View style={styles.timerWrapper}>
          <Icon name="timer-outline" size={16} color={theme.colors.textMuted} />
          <Text style={styles.timerText}>{formatDuration(elapsed)}</Text>
        </View>

        <Pressable onPress={handleFinish} hitSlop={8} style={styles.finishButton}>
          <Text style={styles.finishLabel}>Finish</Text>
        </Pressable>
      </View>

      <DraggableFlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => reorderExercises(data)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: theme.spacing.xxxl + insets.bottom }]}
        ListHeaderComponent={
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Workout name"
            containerStyle={styles.nameInputContainer}
            style={styles.nameInput}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="dumbbell"
            title="No exercises yet"
            description="Add an exercise to start logging sets."
          />
        }
        ListFooterComponent={
          <Pressable style={styles.addExerciseButton} onPress={() => addSheetRef.current?.present()}>
            <Icon name="plus" size={18} color={theme.colors.primary} />
            <Text style={styles.addExerciseLabel}>Add Exercise</Text>
          </Pressable>
        }
      />

      {restTimerActive ? (
        <View style={[styles.restTimerWrapper, { paddingBottom: insets.bottom }]}>
          <RestTimer />
        </View>
      ) : null}

      <BottomSheet ref={addSheetRef} title="Add Exercise">
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
          renderItem={({ item }: { item: Exercise }) => (
            <Pressable style={styles.pickerRow} onPress={() => handleAddExercise(item)}>
              <View style={styles.pickerInfo}>
                <Text style={styles.pickerName}>{item.name}</Text>
                <Text style={styles.pickerSubtitle}>
                  {item.muscleGroups.join(', ')} • {item.equipment}
                </Text>
              </View>
              <Icon
                name={addedExerciseIds.has(item.id) ? 'check-circle' : 'plus-circle-outline'}
                size={22}
                color={addedExerciseIds.has(item.id) ? theme.colors.success : theme.colors.primary}
              />
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    headerButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
    },
    timerWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    timerText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
      fontVariant: ['tabular-nums'],
    },
    finishButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
    },
    finishLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.onPrimary,
    },
    content: {
      padding: theme.spacing.base,
    },
    nameInputContainer: {
      marginBottom: theme.spacing.md,
    },
    nameInput: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold as '700',
    },
    exerciseWrapper: {
      marginBottom: theme.spacing.sm,
    },
    addExerciseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.md,
    },
    addExerciseLabel: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.primary,
    },
    restTimerWrapper: {
      backgroundColor: theme.colors.surfaceElevated,
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
