import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetModal as GorhomBottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme';

export type BottomSheetRef = React.ComponentRef<typeof GorhomBottomSheetModal>;

interface BottomSheetProps {
  children: React.ReactNode;
  title?: string;
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
  enableDynamicSizing?: boolean;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ children, title, snapPoints, onDismiss, enableDynamicSizing = false }, ref) => {
    const theme = useTheme();
    const points = useMemo(() => snapPoints ?? ['60%', '92%'], [snapPoints]);

    const styles = StyleSheet.create({
      content: {
        flex: 1,
        paddingHorizontal: theme.spacing.base,
      },
      title: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold as '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
      },
      body: {
        flex: 1,
      },
    });

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    );

    return (
      <GorhomBottomSheetModal
        ref={ref}
        snapPoints={enableDynamicSizing ? undefined : points}
        enableDynamicSizing={enableDynamicSizing}
        onDismiss={onDismiss}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.content}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <View style={styles.body}>{children}</View>
        </BottomSheetView>
      </GorhomBottomSheetModal>
    );
  },
);

BottomSheet.displayName = 'BottomSheet';
