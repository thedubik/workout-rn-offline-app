import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';

interface WorkoutCalendarProps {
  /** Set of `yyyy-MM-dd` keys for days that have a logged workout. */
  markedDates: Set<string>;
  selectedDate?: Date | null;
  onSelectDate?: (date: Date) => void;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({
  markedDates,
  selectedDate,
  onSelectDate,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate ?? new Date()));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth));
    const end = endOfWeek(endOfMonth(visibleMonth));
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setVisibleMonth((month) => subMonths(month, 1))}
          hitSlop={8}
          style={styles.navButton}
        >
          <Icon name="chevron-left" size={22} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.monthLabel}>{format(visibleMonth, 'MMMM yyyy')}</Text>
        <Pressable
          onPress={() => setVisibleMonth((month) => addMonths(month, 1))}
          hitSlop={8}
          style={styles.navButton}
        >
          <Icon name="chevron-right" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text key={`weekday-${index}`} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, visibleMonth);
          const marked = markedDates.has(key);
          const selected = selectedDate ? isSameDay(day, selectedDate) : false;
          const today = isToday(day);

          return (
            <Pressable
              key={key}
              style={styles.dayCell}
              onPress={() => onSelectDate?.(day)}
              disabled={!onSelectDate}
            >
              <View
                style={[
                  styles.dayCircle,
                  today && !selected && styles.dayCircleToday,
                  selected && styles.dayCircleSelected,
                ]}
              >
                <Text
                  style={[styles.dayLabel, !inMonth && styles.dayLabelMuted, selected && styles.dayLabelSelected]}
                >
                  {format(day, 'd')}
                </Text>
              </View>
              {marked ? <View style={[styles.dot, selected && styles.dotSelected]} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    navButton: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
    },
    monthLabel: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold as '700',
      color: theme.colors.text,
    },
    weekRow: {
      flexDirection: 'row',
    },
    weekdayLabel: {
      flex: 1,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold as '600',
      color: theme.colors.textMuted,
      paddingBottom: theme.spacing.xs,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: `${100 / 7}%`,
      alignItems: 'center',
      paddingVertical: theme.spacing.xxs,
    },
    dayCircle: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCircleToday: {
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    dayCircleSelected: {
      backgroundColor: theme.colors.primary,
    },
    dayLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    dayLabelMuted: {
      color: theme.colors.textMuted,
    },
    dayLabelSelected: {
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.fontWeight.bold as '700',
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.secondary,
      marginTop: 2,
    },
    dotSelected: {
      backgroundColor: theme.colors.primary,
    },
  });
