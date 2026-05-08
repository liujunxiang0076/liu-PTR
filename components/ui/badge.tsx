/**
 * Badge 组件
 * 用于显示状态、分类等标签
 */

import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing, BorderRadius, FontSize, FontWeight, StatusColors } from '@/constants/design-tokens';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

type Props = {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: string;
  style?: ViewStyle;
};

export function Badge({ label, variant = 'default', size = 'sm', color, style }: Props) {
  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];

  const containerStyle: ViewStyle = {
    ...sizeStyle.container,
    ...variantStyle.container,
  };

  if (color) {
    containerStyle.backgroundColor = color;
  }

  return (
    <View style={[containerStyle, style]}>
      <ThemedText style={[sizeStyle.text, variantStyle.text]}>{label}</ThemedText>
    </View>
  );
}

const sizeStyles = StyleSheet.create({
  sm: {
    container: {
      paddingHorizontal: Spacing.xs,
      paddingVertical: 1,
      borderRadius: BorderRadius.xs,
      minWidth: 16,
      alignItems: 'center',
    },
    text: {
      fontSize: FontSize.xs - 1,
      fontWeight: FontWeight.bold,
      lineHeight: 14,
    },
  },
  md: {
    container: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      minWidth: 24,
      alignItems: 'center',
    },
    text: {
      fontSize: FontSize.xs,
      fontWeight: FontWeight.semibold,
      lineHeight: 16,
    },
  },
});

const variantStyles = StyleSheet.create({
  default: {
    container: {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    text: {
      color: '#11181C',
    },
  },
  success: {
    container: {
      backgroundColor: StatusColors.success,
    },
    text: {
      color: '#FFFFFF',
    },
  },
  warning: {
    container: {
      backgroundColor: StatusColors.warning,
    },
    text: {
      color: '#FFFFFF',
    },
  },
  danger: {
    container: {
      backgroundColor: StatusColors.danger,
    },
    text: {
      color: '#FFFFFF',
    },
  },
  info: {
    container: {
      backgroundColor: StatusColors.info,
    },
    text: {
      color: '#FFFFFF',
    },
  },
});
