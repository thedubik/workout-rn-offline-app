import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { RootStackScreenProps } from '../../navigation/types';
import { createExercise, fetchExerciseById, updateExercise } from '../../database/helpers';
import { EQUIPMENT_TYPES, EXERCISE_TYPES } from '../../types/exercise';
import { MUSCLE_GROUPS, muscleGroupColors } from '../../utils/muscleGroups';
import { Badge, Button, Input, LoadingSpinner } from '../../components/common';

type Props = RootStackScreenProps<'CreateExercise'>;

const exerciseFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  muscleGroups: z.array(z.enum(MUSCLE_GROUPS)).min(1, 'Select at least one muscle group'),
  equipment: z.enum(EQUIPMENT_TYPES),
  type: z.enum(EXERCISE_TYPES),
  notes: z.string().optional(),
});

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

const DEFAULT_VALUES: ExerciseFormValues = {
  name: '',
  muscleGroups: [],
  equipment: 'Barbell',
  type: 'strength',
  notes: '',
};

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

export const CreateExerciseScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const exerciseId = route.params?.exerciseId;

  const [loading, setLoading] = useState(!!exerciseId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useLayoutEffect(() => {
    navigation.setOptions({ title: exerciseId ? 'Edit Exercise' : 'New Exercise' });
  }, [navigation, exerciseId]);

  useEffect(() => {
    if (!exerciseId) return;
    let cancelled = false;

    fetchExerciseById(exerciseId).then((exercise) => {
      if (cancelled || !exercise) return;
      reset({
        name: exercise.name,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        type: exercise.type,
        notes: exercise.notes ?? '',
      });
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [exerciseId, reset]);

  const onSubmit = useCallback(
    async (values: ExerciseFormValues) => {
      const payload = {
        name: values.name.trim(),
        muscleGroups: values.muscleGroups,
        equipment: values.equipment,
        type: values.type,
        notes: values.notes?.trim() || undefined,
      };

      if (exerciseId) {
        await updateExercise(exerciseId, payload);
      } else {
        await createExercise(payload);
      }

      navigation.goBack();
    },
    [exerciseId, navigation],
  );

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading exercise..." />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Name"
            placeholder="e.g. Barbell Bench Press"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
            autoCapitalize="words"
          />
        )}
      />

      <Controller
        control={control}
        name="muscleGroups"
        render={({ field: { value, onChange } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Muscle Groups</Text>
            <View style={styles.chipsWrap}>
              {MUSCLE_GROUPS.map((group) => {
                const selected = value.includes(group);
                return (
                  <Pressable
                    key={group}
                    onPress={() =>
                      onChange(selected ? value.filter((item) => item !== group) : [...value, group])
                    }
                  >
                    <Badge
                      label={group}
                      color={muscleGroupColors[group]}
                      variant={selected ? 'filled' : 'outline'}
                    />
                  </Pressable>
                );
              })}
            </View>
            {errors.muscleGroups ? <Text style={styles.errorText}>{errors.muscleGroups.message}</Text> : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="equipment"
        render={({ field: { value, onChange } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Equipment</Text>
            <View style={styles.chipsWrap}>
              {EQUIPMENT_TYPES.map((option) => (
                <Pressable key={option} onPress={() => onChange(option)}>
                  <Badge label={option} variant={value === option ? 'filled' : 'outline'} />
                </Pressable>
              ))}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field: { value, onChange } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Exercise Type</Text>
            <View style={styles.chipsWrap}>
              {EXERCISE_TYPES.map((option) => (
                <Pressable key={option} onPress={() => onChange(option)}>
                  <Badge label={capitalize(option)} variant={value === option ? 'filled' : 'outline'} />
                </Pressable>
              ))}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Notes (optional)"
            placeholder="Form cues, variations, etc."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.notesInput}
          />
        )}
      />

      <Button
        label="Save Exercise"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        fullWidth
        size="lg"
        style={styles.saveButton}
      />
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
    field: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium as '500',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    errorText: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.error,
    },
    notesInput: {
      minHeight: 100,
    },
    saveButton: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
  });
