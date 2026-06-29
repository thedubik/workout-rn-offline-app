import React, { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
  containerStyle?: object;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, rightElement, containerStyle, style, ...rest }, ref) => {
    const theme = useTheme();
    const styles = StyleSheet.create({
      container: {
        marginBottom: theme.spacing.md,
      },
      label: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium as '500',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
      },
      inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: error ? theme.colors.error : theme.colors.border,
        paddingHorizontal: theme.spacing.md,
      },
      input: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text,
      },
      helper: {
        marginTop: theme.spacing.xs,
        fontSize: theme.typography.fontSize.xs,
        color: error ? theme.colors.error : theme.colors.textMuted,
      },
    });

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={styles.inputRow}>
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={theme.colors.textMuted}
            {...rest}
          />
          {rightElement}
        </View>
        {error || helperText ? <Text style={styles.helper}>{error ?? helperText}</Text> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';
