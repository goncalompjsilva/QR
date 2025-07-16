import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QrCode } from 'lucide-react-native';
import { GradientBackground } from '../components';
import { Box, VStack } from '../ui/layout';
import { Text } from '../ui/text';

interface SplashScreenProps {
  onAuthenticationCheck: (isAuthenticated: boolean) => void;
}

export default function SplashScreen({ onAuthenticationCheck }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // Increase by 2% every interval
      });
    }, 50); // Update every 50ms for smooth animation

    // The AuthContext handles the authentication check now
    // This is just for display purposes
    const timer = setTimeout(() => {
      // This won't be called since AuthContext manages the state
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <Box className="flex-1 justify-center items-center">
      <StatusBar style="auto" />
      
      {/* Main Content with Gradient */}
      <GradientBackground>
        <VStack className="flex-1 px-8">
        
        {/* Spacer for top */}
        <Box className="flex-1" />
        
        {/* Logo/Brand Section */}
        <VStack className="items-center mb-16">
          {/* Logo Container */}
          <Box className="w-32 h-32 bg-white rounded-3xl mb-8 justify-center items-center shadow-lg">
            <QrCode size={96} color="#fb923c" />
          </Box>
          
          {/* App Name */}
          <Text className="text-4xl text-white text-center mb-2 font-montserrat-bold">
            QRewards
          </Text>
          
          {/* Tagline */}
          <Text className="text-lg text-white text-center max-w-xs font-montserrat-medium">
            Connect. Collect. Reward.
          </Text>
        </VStack>

        {/* Spacer for bottom */}
        <Box className="flex-1" />
        </VStack>
      </GradientBackground>
    </Box>
  );
}
