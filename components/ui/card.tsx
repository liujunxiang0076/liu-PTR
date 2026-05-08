/**
 * Card 组件
 * 统一的卡片容器
 */

import React from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { Spacing, BorderRadius } from '@/constants/design-tokens';

type CardVariant = 'default' | 'compact' | 'flat';

type Props = ViewProps & {
  variant?: CardVariant;
  borderColor?: string;
  backgroundColor?: string;
  noBorder?: boolean;
};

export function Card({
  variant = 'default',
  borderColor,
  backgroundColor,
  noBorder = false,
  style,
  children,
  ...props
}: Props) {
  const variantStyle = variantStyles[variant];

  const dynamicStyle: ViewStyle = {};
  if (borderColor) dynamicStyle.borderColor = borderColor;
  if (backgroundColor) dynamicStyle.backgroundColor = backgroundColor;
  if (noBorder) dynamicStyle.borderWidth = 0;

  return (
    <View style={[variantStyle, dynamicStyle, style]} {...props}>
      {children}
    </View>
  );
}

const variantStyles = StyleSheet.create({
  default: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5E5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: '#FFFFFF',
  },
  compact: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5E5',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  flat: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
});
