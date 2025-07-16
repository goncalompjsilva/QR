import React from 'react';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

export function useColorScheme() {
  const { colorScheme, setColorScheme } = useNativewindColorScheme();

  return {
    colorScheme: colorScheme ?? 'light',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme: () => setColorScheme(colorScheme === 'light' ? 'dark' : 'light'),
  };
}
