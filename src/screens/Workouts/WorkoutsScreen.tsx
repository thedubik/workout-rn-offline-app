import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { MainTabScreenProps } from '../../navigation/types';
import { deleteTemplate, fetchExercises, fetchTemplates } from '../../database/helpers';
import type { WorkoutTemplate } from '../../types/workout';
import type { Exercise, MuscleGroup } from '../../types/exercise';
import { MUSCLE_GROUPS } from '../../utils/muscleGroups';
import { Badge, EmptyState, FAB, Input, LoadingSpinner } from '../../components/common';
import { WorkoutCard } from '../../components/workout';
import { startWorkoutFromTemplate } from '../../utils/startWorkout';

type Props = MainTabScreenProps<'Workouts'>;

export const WorkoutsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null);

  const loadData = useCallback(async () => {
    const [templatesData, exercisesData] = await Promise.all([fetchTemplates(), fetchExercises()]);
    setTemplates(templatesData);
    setExercises(exercisesData);
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

  const exerciseMap = useMemo(() => new Map(exercises.map((exercise) => [exercise.id, exercise])), [exercises]);

  const templateMuscleGroups = useCallback(
    (template: WorkoutTemplate): MuscleGroup[] => {
      const groups = new Set<MuscleGroup>();
      template.exercises.forEach((templateExercise) => {
        const exercise = exerciseMap.get(templateExercise.exerciseId);
        exercise?.muscleGroups.forEach((group) => groups.add(group));
      });
      return Array.from(groups);
    },
    [exerciseMap],
  );

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesSearch = !query || template.name.toLowerCase().includes(query);
      const matchesGroup = !selectedGroup || templateMuscleGroups(template).includes(selectedGroup);
      return matchesSearch && matchesGroup;
    });
  }, [templates, search, selectedGroup, templateMuscleGroups]);

  const handleStart = useCallback(
    async (template: WorkoutTemplate) => {
      await startWorkoutFromTemplate(template);
      navigation.navigate('ActiveWorkout', { templateId: template.id });
    },
    [navigation],
  );

  const handleEdit = useCallback(
    (template: WorkoutTemplate) => {
      navigation.navigate('CreateTemplate', { templateId: template.id });
    },
    [navigation],
  );

  const handleDelete = useCallback((template: WorkoutTemplate) => {
    Alert.alert('Delete Template', `Delete "${template.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTemplate(template.id);
          setTemplates((prev) => prev.filter((item) => item.id !== template.id));
        },
      },
    ]);
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading templates..." />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Workouts</Text>

        <Input
          placeholder="Search templates"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          containerStyle={styles.searchInput}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <Pressable onPress={() => setSelectedGroup(null)}>
            <Badge label="All" variant={selectedGroup === null ? 'filled' : 'outline'} />
          </Pressable>
          {MUSCLE_GROUPS.map((group) => (
            <Pressable key={group} onPress={() => setSelectedGroup((current) => (current === group ? null : group))}>
              <Badge label={group} variant={selectedGroup === group ? 'filled' : 'outline'} />
            </Pressable>
          ))}
        </ScrollView>

        {filteredTemplates.length === 0 ? (
          <EmptyState
            icon="dumbbell"
            title={templates.length === 0 ? 'No templates yet' : 'No matching templates'}
            description={
              templates.length === 0
                ? 'Create a template to quickly start your favorite workouts.'
                : 'Try a different search or muscle group filter.'
            }
            actionLabel={templates.length === 0 ? 'Create Template' : undefined}
            onAction={templates.length === 0 ? () => navigation.navigate('CreateTemplate') : undefined}
          />
        ) : (
          filteredTemplates.map((template) => (
            <WorkoutCard
              key={template.id}
              template={template}
              onPress={() => handleStart(template)}
              onEdit={() => handleEdit(template)}
              onDelete={() => handleDelete(template)}
            />
          ))
        )}
      </ScrollView>

      <FAB icon="plus" onPress={() => navigation.navigate('CreateTemplate')} />
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
    searchInput: {
      marginBottom: theme.spacing.sm,
    },
    chipsRow: {
      gap: theme.spacing.xs,
      paddingBottom: theme.spacing.base,
    },
  });
