import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QrCode } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import { Box } from '../ui/box';
import { VStack } from '../ui/vstack';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { Progress, ProgressFilledTrack } from '../ui/progress';

interface SplashScreenProps {
  onAuthenticationCheck: (isAuthenticated: boolean) => void;
}

export default function SplashScreen({ onAuthenticationCheck }: SplashScreenProps) {
  const { colorScheme } = useColorScheme();
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

  // Define gradient colors based on theme
  const gradientColors: [string, string, string] = colorScheme === 'dark' 
    ? ['#ff6b35','#ffa726', '#ffa726'] // primary-900 to primary-800
    : ['#ff6b35', '#ffa726', '#ffa726']; // primary-50 to primary-100

  return (
    <Box className="flex-1 justify-center items-center">
      <StatusBar style="auto" />
      
      {/* Main Content with Gradient */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, width: '100%' }}
      >
        <VStack className="flex-1 px-8">
        
        {/* Spacer for top */}
        <Box className="flex-1" />
        
        {/* Logo/Brand Section */}
        <VStack className="items-center mb-16">
          {/* Logo Container */}
          <Box className="w-32 h-32 bg-primary-0 rounded-3xl mb-8 justify-center items-center shadow-soft-2">
            <QrCode size={80} color="#fb923c" />
          </Box>
          
          {/* App Name */}
          <Text className="text-4xl text-typography-0 text-center mb-2 font-montserrat-bold">
            QRewards
          </Text>
          
          {/* Tagline */}
          <Text className="text-lg text-typography-0 text-center max-w-xs font-montserrat-medium">
            Connect. Collect. Reward.
          </Text>
        </VStack>

        {/* Loading Section */}
        <VStack className="items-center">
          <HStack className="items-center mb-4">
            <Progress className="w-64 bg-primary-0" value={progress}>
              <ProgressFilledTrack 
                className="bg-primary-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </Progress>
          </HStack>
          <Text className="text-typography-0 text-sm font-montserrat-medium">
            {Math.round(progress)}%
          </Text>
        </VStack>

        {/* Spacer for bottom */}
        <Box className="flex-1" />

        {/* Footer */}
        <Box className="pb-8 px-8">
          <Text className="text-center text-typography-0 text-sm opacity-80">
            © 2025 QRewards. All rights reserved.
          </Text>
        </Box>
        </VStack>
      </LinearGradient>
    </Box>
  );
}
