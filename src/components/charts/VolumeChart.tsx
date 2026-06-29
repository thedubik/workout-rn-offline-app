import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Bar, CartesianChart } from 'victory-native';
import { format } from 'date-fns';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import { EmptyState } from '../common';
import { useChartFont } from './chartFont';

export type VolumeChartPoint = {
  date: number;
  volume: number;
};

interface VolumeChartProps {
  data: VolumeChartPoint[];
  emptyLabel?: string;
}

export const VolumeChart: React.FC<VolumeChartProps> = ({
  data,
  emptyLabel = 'No workouts logged yet',
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const font = useChartFont();

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <EmptyState
          icon="chart-bar"
          title={emptyLabel}
          description="Finish a workout to start tracking your training volume."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CartesianChart
        data={data}
        xKey="date"
        yKeys={['volume']}
        domainPadding={{ left: 24, right: 24, top: 24, bottom: 4 }}
        axisOptions={{
          font,
          labelColor: theme.colors.textMuted,
          lineColor: theme.colors.chartGrid,
          formatXLabel: (ms) => format(new Date(ms), 'MMM d'),
          formatYLabel: (value) => `${Math.round(value / 1000)}k`,
        }}
      >
        {({ points, chartBounds }) => (
          <Bar
            points={points.volume}
            chartBounds={chartBounds}
            color={theme.colors.chartLineSecondary}
            roundedCorners={{ topLeft: 6, topRight: 6 }}
            barWidth={Math.min(28, 280 / Math.max(1, data.length))}
          />
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
