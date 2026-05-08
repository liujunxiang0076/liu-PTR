/**
 * Button 组件
 * 统一的按钮样式
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/design-tokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type Props = TouchableOpacityProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  color?: string;
  fullWidth?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  color,
  fullWidth = false,
  disabled,
  style,
  ...props
}: Props) {
  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];

  const containerStyle: ViewStyle = {
    ...sizeStyle.container,
    ...variantStyle.container,
  };

  if (color) {
    if (variant === 'primary') {
      containerStyle.backgroundColor = color;
    } else if (variant === 'outline') {
      containerStyle.borderColor = color;
    }
  }

  if (fullWidth) {
    containerStyle.width = '100%';
  }

  if (disabled) {
    containerStyle.opacity = 0.5;
  }

  const textStyle: TextStyle = {
    ...sizeStyle.text,
    ...variantStyle.text,
  };

  if (color && variant !== 'primary') {
    textStyle.color = color;
  }

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <ThemedText style={textStyle}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const sizeStyles = StyleSheet.create({
  sm: {
    container: {
      height: 32,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.sm,
    },
    text: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
    },
  },
  md: {
    container: {
      height: 40,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
    },
    text: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.medium,
    },
  },
  lg: {
    container: {
      height: 48,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.lg,
    },
    text: {
      fontSize: FontSize.lg,
      fontWeight: FontWeight.semibold,
    },
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    container: {
      backgroundColor: '#0a7ea4',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: '#FFFFFF',
    },
  },
  secondary: {
    container: {
      backgroundColor: 'rgba(0,0,0,0.05)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: '#11181C',
    },
  },
  outline: {
    container: {
      borderWidth: 1,
      borderColor: '#0a7ea4',
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: '#0a7ea4',
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: '#0a7ea4',
    },
  },
});
