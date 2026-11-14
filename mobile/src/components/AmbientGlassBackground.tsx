import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const AmbientGlassBackground: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 3D Sculptural Carbon Ribs Wallpaper (Exact User Texture) */}
      <Image
        source={require('../../assets/bg-carbon.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Subtle Ambient Violet Luxury Glow inspired by FinTech / ElevenLabs UI */}
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.12)', 'transparent', 'rgba(124, 58, 237, 0.08)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      {/* Subtle Carbon Glass Scrim for Crisp Contrast */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(5, 5, 8, 0.38)' }
        ]}
      />
    </View>
  );
};

export default AmbientGlassBackground;
