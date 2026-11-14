import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../theme/colors';

interface GlassViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  variant?: 'card' | 'elevated' | 'subtle' | 'pill' | 'panel';
  borderRadius?: number;
  tint?: 'dark' | 'light' | 'default';
}

export const GlassView: React.FC<GlassViewProps> = ({
  children,
  style,
  intensity = 35,
  variant = 'card',
  borderRadius = 18,
  tint = 'dark'
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: COLORS.glassBgElevated,
          borderColor: COLORS.glassBorderHighlight,
          borderWidth: 1
        };
      case 'subtle':
        return {
          backgroundColor: COLORS.glassBgSubtle,
          borderColor: COLORS.glassBorderSubtle,
          borderWidth: 1
        };
      case 'pill':
        return {
          backgroundColor: COLORS.glassBgDark,
          borderColor: COLORS.glassBorder,
          borderWidth: 1,
          borderRadius: 999
        };
      case 'panel':
        return {
          backgroundColor: COLORS.glassBgDarkElevated,
          borderColor: COLORS.glassBorder,
          borderWidth: 1
        };
      case 'card':
      default:
        return {
          backgroundColor: COLORS.glassBg,
          borderColor: COLORS.glassBorder,
          borderWidth: 1
        };
    }
  };

  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    ...getVariantStyles(),
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        } as any)
      : {})
  };

  // On native (iOS/Android) BlurView provides physical backdrop blur
  if (Platform.OS !== 'web') {
    return (
      <View style={[containerStyle, style]}>
        <BlurView
          intensity={intensity}
          tint={tint}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    position: 'relative',
    zIndex: 1
  }
});

export default GlassView;
