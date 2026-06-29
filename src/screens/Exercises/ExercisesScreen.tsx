import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { MainTabScreenProps } from '../../navigation/types';
import { fetchExercises } from '../../database/helpers';
import type { Exercise, MuscleGroup } from '../../types/exercise';
import { MUSCLE_GROUPS, muscleGroupColors, muscleGroupIcons } from '../../utils/muscleGroups';
import { Badge, EmptyState, FAB, Input, LoadingSpinner } from '../../components/common';

type Props = MainTabScreenProps<'Exercises'>;

interface ExerciseListItemProps {
  exercise: Exercise;
  onPress: () => void;
}

const ExerciseListItem: React.FC<ExerciseListItemProps> = ({ exercise, onPress }) => {
  const theme = useTheme();
  const styles = useItemStyles(theme);
  const primaryGroup = exercise.muscleGroups[0];
  const accent = primaryGroup ? muscleGroupColors[primaryGroup] : theme.colors.primary;
  const iconName = primaryGroup ? muscleGroupIcons[primaryGroup] : 'dumbbell';

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.iconWrapper, { backgroundColor: `${accent}26` }]}>
        <Icon name={iconName} size={20} color={accent} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {exercise.muscleGroups.join(', ')} • {exercise.equipment}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color={theme.colors.textMuted} />
    </Pressable>
  );
};

export const ExercisesScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      fetchExercises().then((data) => {
        if (!cancelled) {
          setExercises(data);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesSearch = !query || exercise.name.toLowerCase().includes(query);
      const matchesGroup = !selectedGroup || exercise.muscleGroups.includes(selectedGroup);
      return matchesSearch && matchesGroup;
    });
  }, [exercises, search, selectedGroup]);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading exercises..." />;
  }

  return (
    <View style={styles.screen}>
      <FlashList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseListItem
            exercise={item}
            onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
          />
        )}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Exercises</Text>
            <Input
              placeholder="Search exercises"
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
                <Pressable
                  key={group}
                  onPress={() => setSelectedGroup((current) => (current === group ? null : group))}
                >
                  <Badge
                    label={group}
                    color={muscleGroupColors[group]}
                    variant={selectedGroup === group ? 'filled' : 'outline'}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="magnify"
            title="No exercises found"
            description="Try a different search or muscle group filter."
          />
        }
      />

      <FAB icon="plus" onPress={() => navigation.navigate('CreateExercise')} />
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
    header: {
      marginBottom: theme.spacing.sm,
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
      paddingBottom: theme.spacing.sm,
    },
  });

const useItemStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
  });
