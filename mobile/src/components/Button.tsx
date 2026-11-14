// =====================================================================
// KREAZYAI BUTTON COMPONENT
// Premium rounded-box button architecture with glow effects
// =====================================================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View
} from 'react-native';
import { COLORS } from '../theme/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: COLORS.primary,
            borderWidth: 0,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 4
          },
          text: { color: '#FFFFFF' }
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: COLORS.cardElevated,
            borderWidth: 1,
            borderColor: COLORS.cardBorderStrong
          },
          text: { color: COLORS.textPrimary }
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: COLORS.cardBorderStrong
          },
          text: { color: COLORS.textPrimary }
        };
      case 'success':
        return {
          container: {
            backgroundColor: COLORS.success,
            borderWidth: 0
          },
          text: { color: '#FFFFFF' }
        };
      case 'danger':
        return {
          container: {
            backgroundColor: 'rgba(255, 255, 255, 0.10)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.25)'
          },
          text: { color: '#FFFFFF' }
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0
          },
          text: { color: '#FFFFFF' }
        };
      default:
        return {
          container: {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.28)'
          },
          text: { color: '#FFFFFF' }
        };
    }
  };

  const currentStyle = getStyles();

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 24 };
      case 'md':
      default:
        return { paddingVertical: 12, paddingHorizontal: 18 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 13;
      case 'lg':
        return 16;
      case 'md':
      default:
        return 14;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        currentStyle.container,
        getPadding(),
        (disabled || loading) && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={currentStyle.text.color} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.baseText,
              currentStyle.text,
              { fontSize: getFontSize() },
              textStyle
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    marginRight: 8
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2
  },
  disabled: {
    opacity: 0.5
  }
});

export default Button;
