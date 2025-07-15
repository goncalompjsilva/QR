import React, { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Box } from '../ui/box';
import { VStack } from '../ui/vstack';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Input, InputField } from '../ui/input';
import { FormControl } from '../ui/form-control';
import { Spinner } from '../ui/spinner';
import { Pressable } from '../ui/pressable';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../api/auth';
import { getErrorMessage } from '../api';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      await login(phoneNumber.trim(), password || undefined);
      
      Alert.alert('Success', 'Login successful!', [
        { text: 'OK', onPress: onLoginSuccess }
      ]);
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Get Google authorization URL
      const { auth_url } = await AuthService.getGoogleAuthUrl();
      
      // Open Google OAuth in browser
      const supported = await Linking.canOpenURL(auth_url);
      if (supported) {
        await Linking.openURL(auth_url);
        
        // Note: In a real app, you'd handle the callback properly
        // For now, we'll show a message to the user
        Alert.alert(
          'Google Sign In', 
          'Please complete the sign-in process in your browser and return to the app.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Unable to open Google sign-in page');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Google Sign In Failed', getErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Box className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar style="auto" />
      
      <VStack className="flex-1 px-6 pt-16">
        {/* Header */}
        <VStack className="items-center mb-12">
          <Box className="w-20 h-20 bg-primary-500 rounded-2xl mb-4 justify-center items-center">
            <Text className="text-4xl">📱</Text>
          </Box>
          <Text className="text-3xl font-bold text-typography-900 mb-2">
            Welcome Back
          </Text>
          <Text className="text-typography-600 text-center">
            Sign in to continue scanning and ordering
          </Text>
        </VStack>

        {/* Login Form */}
        <VStack className="space-y-6 mb-8">
          {/* Phone Number Input */}
          <FormControl>
            <Text className="text-typography-700 font-medium mb-2">
              Phone Number
            </Text>
            <Input className="border-outline-300 focus:border-primary-500">
              <InputField
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Input>
          </FormControl>

          {/* Password Input */}
          <FormControl>
            <Text className="text-typography-700 font-medium mb-2">
              Password (Optional)
            </Text>
            <Input className="border-outline-300 focus:border-primary-500">
              <InputField
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Input>
            <Text className="text-typography-500 text-sm mt-1">
              Leave empty if you don't have a password
            </Text>
          </FormControl>

          {/* Login Button */}
          <Button
            onPress={handleLogin}
            disabled={loading || !phoneNumber.trim()}
            className="bg-primary-500 py-4 rounded-lg"
          >
            {loading ? (
              <HStack className="items-center">
                <Spinner className="text-white mr-2" size="small" />
                <Text className="text-white font-semibold">Signing In...</Text>
              </HStack>
            ) : (
              <Text className="text-white font-semibold text-lg">Sign In</Text>
            )}
          </Button>
        </VStack>

        {/* Divider */}
        <VStack className="items-center mb-6">
          <HStack className="items-center w-full">
            <Box className="flex-1 h-px bg-outline-200" />
            <Text className="mx-4 text-typography-500">or</Text>
            <Box className="flex-1 h-px bg-outline-200" />
          </HStack>
        </VStack>

        {/* Google Sign In Button */}
        <Button
          onPress={handleGoogleLogin}
          disabled={googleLoading}
          variant="outline"
          className="border-outline-300 py-4 rounded-lg mb-8"
        >
          {googleLoading ? (
            <HStack className="items-center">
              <Spinner className="text-primary-500 mr-2" size="small" />
              <Text className="text-primary-500 font-semibold">Connecting...</Text>
            </HStack>
          ) : (
            <HStack className="items-center">
              <Text className="text-2xl mr-3">🔍</Text>
              <Text className="text-typography-700 font-semibold text-lg">
                Continue with Google
              </Text>
            </HStack>
          )}
        </Button>

        {/* Sign Up Link */}
        <VStack className="items-center">
          <HStack className="items-center">
            <Text className="text-typography-600">Don't have an account? </Text>
            <Pressable onPress={onNavigateToRegister}>
              <Text className="text-primary-500 font-semibold">Sign Up</Text>
            </Pressable>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
}
