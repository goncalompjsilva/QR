import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Box } from '../ui/box';
import { VStack } from '../ui/vstack';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { Spinner } from '../ui/spinner';

interface SplashScreenProps {
  onAuthenticationCheck: (isAuthenticated: boolean) => void;
}

export default function SplashScreen({ onAuthenticationCheck }: SplashScreenProps) {
  useEffect(() => {
    // The AuthContext handles the authentication check now
    // This is just for display purposes
    const timer = setTimeout(() => {
      // This won't be called since AuthContext manages the state
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar style="auto" />
      
      {/* Main Content */}
      <VStack className="flex-1 justify-center items-center px-8 bg-gradient-to-b from-primary-50 to-primary-100">
        
        {/* Logo/Brand Section */}
        <VStack className="items-center mb-16">
          {/* Logo Container */}
          <Box className="w-32 h-32 bg-primary-500 rounded-3xl mb-6 justify-center items-center shadow-soft-2">
            <Text className="text-6xl">📱</Text>
          </Box>
          
          {/* App Name */}
          <Text className="text-4xl font-bold text-typography-900 text-center mb-2">
            QR Scanner
          </Text>
          
          {/* Tagline */}
          <Text className="text-lg text-typography-600 text-center max-w-xs">
            Scan, Order & Enjoy
          </Text>
        </VStack>

        {/* Loading Section */}
        <VStack className="items-center">
          <HStack className="items-center mb-4">
            <Spinner className="text-primary-500 mr-3" size="small" />
            <Text className="text-typography-700 text-lg">
              Loading...
            </Text>
          </HStack>
          
          {/* Version or additional info */}
          <Text className="text-typography-500 text-sm">
            Version 1.0.0
          </Text>
        </VStack>
      </VStack>

      {/* Footer */}
      <Box className="pb-8 px-8">
        <Text className="text-center text-typography-500 text-sm">
          © 2025 QR Scanner. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
}
