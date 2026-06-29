import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import { formatDuration } from '../../utils/formatDuration';
import { useRestTimer } from '../../hooks/useRestTimer';

const SIZE = 64;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER = SIZE / 2;

export const RestTimer: React.FC = () => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { isActive, remaining, duration, progress, addTime, skip } = useRestTimer();

  const path = useMemo(() => {
    const skPath = Skia.Path.Make();
    skPath.addCircle(CENTER, CENTER, RADIUS);
    return skPath;
  }, []);

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <View style={styles.ringWrapper}>
        <Canvas style={styles.canvas}>
          <Path
            path={path}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
            strokeCap="round"
            color={theme.colors.border}
            start={0}
            end={1}
          />
          <Path
            path={path}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
            strokeCap="round"
            color={theme.colors.primary}
            start={0}
            end={Math.max(0.001, 1 - progress)}
            origin={{ x: CENTER, y: CENTER }}
            transform={[{ rotate: -Math.PI / 2 }]}
          />
        </Canvas>
        <View style={styles.timeOverlay}>
          <Text style={styles.timeText}>{remaining}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.label}>Rest Timer</Text>
        <Text style={styles.subLabel}>
          {formatDuration(remaining)} of {formatDuration(duration)}
        </Text>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={() => addTime(15)}>
          <Text style={styles.controlLabel}>+15s</Text>
        </Pressable>
        <Pressable style={[styles.controlButton, styles.skipButton]} onPress={skip}>
          <Icon name="skip-next" size={18} color={theme.colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
};

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
      backgroundColor: theme.colors.surfaceElevated,
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },
    ringWrapper: {
      width: SIZE,
      height: SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    canvas: {
      width: SIZE,
      height: SIZE,
    },
    timeOverlay: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timeText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
    },
    info: {
      flex: 1,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
    },
    subLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    controlButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.text,
    },
    skipButton: {
      backgroundColor: theme.colors.primary,
      width: 36,
      height: 36,
    },
  });
