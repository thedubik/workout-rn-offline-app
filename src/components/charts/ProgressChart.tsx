import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Area, CartesianChart, Line } from 'victory-native';
import { format } from 'date-fns';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import { EmptyState } from '../common';
import { useChartFont } from './chartFont';

export type ProgressChartPoint = {
  date: number;
  value: number;
};

interface ProgressChartProps {
  data: ProgressChartPoint[];
  valueSuffix?: string;
  emptyLabel?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  valueSuffix = '',
  emptyLabel = 'Not enough data yet',
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const font = useChartFont();

  if (data.length < 2) {
    return (
      <View style={styles.empty}>
        <EmptyState
          icon="chart-line"
          title={emptyLabel}
          description="Log a few more workouts to see your progress over time."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CartesianChart
        data={data}
        xKey="date"
        yKeys={['value']}
        domainPadding={{ left: 16, right: 16, top: 24, bottom: 4 }}
        axisOptions={{
          font,
          labelColor: theme.colors.textMuted,
          lineColor: theme.colors.chartGrid,
          formatXLabel: (ms) => format(new Date(ms), 'MMM d'),
          formatYLabel: (value) => `${Math.round(value)}${valueSuffix}`,
        }}
      >
        {({ points, chartBounds }) => (
          <>
            <Area
              points={points.value}
              y0={chartBounds.bottom}
              curveType="natural"
              color={theme.colors.chartArea}
            />
            <Line points={points.value} curveType="natural" color={theme.colors.chartLine} strokeWidth={2.5} />
          </>
        )}
      </CartesianChart>
    </View>
  );
};

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      height: 220,
    },
    empty: {
      minHeight: 180,
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
    },
  });
