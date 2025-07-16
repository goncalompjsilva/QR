import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '../../lib/useColorScheme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: any;
  colors?: [string, string, string];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export default function GradientBackground({ 
  children, 
  style,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 }
}: GradientBackgroundProps) {
  const { colorScheme } = useColorScheme();
  
  // Define default gradient colors based on theme
  const defaultGradientColors: [string, string, string] = colors || (colorScheme === 'dark' 
    ? ['#ff6b35','#ffa726', '#ffa726'] // primary-900 to primary-800
    : ['#ff6b35', '#ffa726', '#ffa726']); // primary-50 to primary-100

  return (
    <LinearGradient
      colors={defaultGradientColors}
      start={start}
      end={end}
      style={[{ flex: 1, width: '100%' }, style]}
    >
      {children}
    </LinearGradient>
  );
}
