// =====================================================================
// KREAZYAI BADGE COMPONENT
// Consistent semantic status indicators across all modules
// =====================================================================

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../theme/colors';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'default'
  | 'whatsapp'
  | 'messenger'
  | 'instagram';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: 'rgba(255, 255, 255, 0.12)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.25)' };
      case 'warning':
        return { bg: 'rgba(255, 255, 255, 0.12)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.25)' };
      case 'danger':
        return { bg: 'rgba(255, 255, 255, 0.12)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.25)' };
      case 'info':
        return { bg: 'rgba(255, 255, 255, 0.12)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.25)' };
      case 'purple':
        return { bg: 'rgba(255, 255, 255, 0.12)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.25)' };
      case 'whatsapp':
        return { bg: 'rgba(255, 255, 255, 0.12)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.25)' };
      case 'messenger':
        return { bg: 'rgba(255, 255, 255, 0.12)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.25)' };
      case 'instagram':
        return { bg: 'rgba(255, 255, 255, 0.12)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.25)' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.08)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.15)' };
    }
  };

  const c = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 10
        },
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: c.text,
            fontSize: isSm ? 10 : 12
          }
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase'
  }
});

export default Badge;
