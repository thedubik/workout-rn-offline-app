import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { type RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { RootStackScreenProps } from '../../navigation/types';
import { createTemplate, fetchExercises, fetchTemplateById, updateTemplate } from '../../database/helpers';
import type { TemplateExercise } from '../../types/workout';
import type { Exercise } from '../../types/exercise';
import { generateId } from '../../utils/units';
import { BottomSheet, Button, EmptyState, Input, LoadingSpinner } from '../../components/common';
import type { BottomSheetRef } from '../../components/common';

type Props = RootStackScreenProps<'CreateTemplate'>;

interface TemplateExerciseDraft extends TemplateExercise {
  uid: string;
}

const MIN_TARGET_SETS = 1;
const MAX_TARGET_SETS = 10;

export const CreateTemplateScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const templateId = route.params?.templateId;
  const addSheetRef = useRef<BottomSheetRef>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<TemplateExerciseDraft[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [pickerQuery, setPickerQuery] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ title: templateId ? 'Edit Template' : 'New Template' });
  }, [navigation, templateId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const library = await fetchExercises();
      if (cancelled) return;
      setAllExercises(library);

      if (templateId) {
        const template = await fetchTemplateById(templateId);
        if (!cancelled && template) {
          setName(template.name);
          setExercises(
            [...template.exercises]
              .sort((a, b) => a.order - b.order)
              .map((exercise) => ({ ...exercise, uid: generateId() })),
          );
        }
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const addedExerciseIds = useMemo(() => new Set(exercises.map((exercise) => exercise.exerciseId)), [exercises]);

  const filteredLibrary = useMemo(() => {
    const query = pickerQuery.trim().toLowerCase();
    if (!query) return allExercises;
    return allExercises.filter((exercise) => exercise.name.toLowerCase().includes(query));
  }, [allExercises, pickerQuery]);

  const handleAddExercise = useCallback((exercise: Exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        uid: generateId(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        targetSets: 3,
        order: prev.length,
      },
    ]);
  }, []);

  const handleChangeSets = useCallback((uid: string, delta: number) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.uid === uid
          ? {
              ...exercise,
              targetSets: Math.min(MAX_TARGET_SETS, Math.max(MIN_TARGET_SETS, exercise.targetSets + delta)),
            }
          : exercise,
      ),
    );
  }, []);

  const handleRemoveExercise = useCallback((uid: string) => {
    setExercises((prev) => prev.filter((exercise) => exercise.uid !== uid));
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Template name is required');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('Add an exercise', 'Add at least one exercise to save this template.');
      return;
    }

    setNameError(null);
    setSaving(true);

    const payload = {
      name: trimmedName,
      exercises: exercises.map(
        (exercise, index): TemplateExercise => ({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          targetSets: exercise.targetSets,
          order: index,
        }),
      ),
    };

    if (templateId) {
      await updateTemplate(templateId, payload);
    } else {
      await createTemplate(payload);
    }

    setSaving(false);
    navigation.goBack();
  }, [name, exercises, templateId, navigation]);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<TemplateExerciseDraft>) => (
      <ScaleDecorator>
        <View style={[styles.exerciseRow, isActive && styles.exerciseRowActive]}>
          <Pressable onLongPress={drag} disabled={isActive} hitSlop={8} style={styles.dragHandle}>
            <Icon name="drag-vertical" size={22} color={theme.colors.textMuted} />
          </Pressable>

          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {item.exerciseName}
            </Text>
            <Text style={styles.exerciseSubtitle}>{item.targetSets} sets</Text>
          </View>

          <View style={styles.stepper}>
            <Pressable
              onPress={() => handleChangeSets(item.uid, -1)}
              hitSlop={8}
              style={styles.stepperButton}
            >
              <Icon name="minus" size={16} color={theme.colors.text} />
            </Pressable>
            <Text style={styles.stepperValue}>{item.targetSets}</Text>
            <Pressable
              onPress={() => handleChangeSets(item.uid, 1)}
              hitSlop={8}
              style={styles.stepperButton}
            >
              <Icon name="plus" size={16} color={theme.colors.text} />
            </Pressable>
          </View>

          <Pressable onPress={() => handleRemoveExercise(item.uid)} hitSlop={8} style={styles.removeButton}>
            <Icon name="close" size={18} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      </ScaleDecorator>
    ),
    [styles, theme, handleChangeSets, handleRemoveExercise],
  );

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading template..." />;
  }

  return (
    <View style={styles.screen}>
      <DraggableFlatList
        data={exercises}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
        onDragEnd={({ data }) => setExercises(data)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Input
              label="Template Name"
              placeholder="e.g. Push Day"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError(null);
              }}
              error={nameError ?? undefined}
              autoCapitalize="words"
            />
            <Text style={styles.sectionTitle}>Exercises</Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="format-list-bulleted"
            title="No exercises yet"
            description="Add exercises to build out this template."
          />
        }
        ListFooterComponent={
          <>
            <Pressable style={styles.addExerciseButton} onPress={() => addSheetRef.current?.present()}>
              <Icon name="plus" size={18} color={theme.colors.primary} />
              <Text style={styles.addExerciseLabel}>Add Exercise</Text>
            </Pressable>

            <Button
              label="Save Template"
              onPress={handleSave}
              loading={saving}
              fullWidth
              size="lg"
              style={styles.saveButton}
            />
          </>
        }
      />

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
    content: {
      padding: theme.spacing.base,
      paddingBottom: theme.spacing.xxxl,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    exerciseRow: {
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
    exerciseRowActive: {
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 4,
    },
    dragHandle: {
      padding: theme.spacing.xxs,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
    },
    exerciseSubtitle: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    stepperButton: {
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperValue: {
      minWidth: 16,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
    },
    removeButton: {
      padding: theme.spacing.xxs,
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
      marginBottom: theme.spacing.lg,
    },
    addExerciseLabel: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.primary,
    },
    saveButton: {
      marginBottom: theme.spacing.lg,
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
