import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import type { RootStackScreenProps } from '../../navigation/types';
import { useSettingsStore } from '../../store/settingsStore';
import type { ThemePreference, WeightUnit } from '../../types/settings';
import { REST_TIMER_PRESETS } from '../../types/settings';
import { clearAllData } from '../../database/helpers';
import { seedDatabaseIfNeeded } from '../../database/seeds';
import { Badge, Card } from '../../components/common';
import { version as appVersion } from '../../../package.json';

type Props = RootStackScreenProps<'Settings'>;

const UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lbs', label: 'Pounds (lbs)' },
];

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
  { value: 'dark', label: 'Dark', icon: 'weather-night' },
  { value: 'system', label: 'System', icon: 'theme-light-dark' },
];

const formatRestLabel = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds % 60 === 0) return `${seconds / 60}min`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card>{children}</Card>
    </View>
  );
};

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const unit = useSettingsStore((state) => state.unit);
  const setUnit = useSettingsStore((state) => state.setUnit);
  const restTimerDefault = useSettingsStore((state) => state.restTimerDefault);
  const setRestTimerDefault = useSettingsStore((state) => state.setRestTimerDefault);
  const themePreference = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  const [clearing, setClearing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Settings' });
  }, [navigation]);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear All Data?',
      'This will permanently delete all workout history, templates, and custom exercises. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await clearAllData();
            await seedDatabaseIfNeeded();
            setClearing(false);
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ],
    );
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Section title="Units">
        <View style={styles.optionsColumn}>
          {UNIT_OPTIONS.map((option) => (
            <Pressable key={option.value} style={styles.optionRow} onPress={() => setUnit(option.value)}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Badge label={unit === option.value ? 'Selected' : 'Select'} variant={unit === option.value ? 'filled' : 'outline'} />
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Default Rest Timer">
        <View style={styles.chipsWrap}>
          {REST_TIMER_PRESETS.map((seconds) => (
            <Pressable key={seconds} onPress={() => setRestTimerDefault(seconds)}>
              <Badge
                label={formatRestLabel(seconds)}
                variant={restTimerDefault === seconds ? 'filled' : 'outline'}
              />
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Appearance">
        <View style={styles.chipsWrap}>
          {THEME_OPTIONS.map((option) => (
            <Pressable key={option.value} onPress={() => setTheme(option.value)}>
              <Badge
                label={option.label}
                icon={option.icon}
                variant={themePreference === option.value ? 'filled' : 'outline'}
              />
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Data">
        <Pressable style={styles.optionRow} onPress={handleClearData} disabled={clearing}>
          <Text style={[styles.optionLabel, styles.dangerLabel]}>
            {clearing ? 'Clearing...' : 'Clear All Data'}
          </Text>
          <Badge label="Danger" variant="outline" color={theme.colors.error} />
        </Pressable>
      </Section>

      <Text style={styles.version}>Version {appVersion}</Text>
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
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.sm,
    },
    optionsColumn: {
      gap: theme.spacing.sm,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    optionLabel: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium as '500',
      color: theme.colors.text,
    },
    dangerLabel: {
      color: theme.colors.error,
    },
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    version: {
      textAlign: 'center',
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.sm,
    },
  });
