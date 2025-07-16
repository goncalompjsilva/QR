import React, { useState } from 'react';
import { Alert, Linking, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GradientBackground } from '../components';
import { QrCode, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Box, VStack, HStack } from '../ui/layout';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FormControl, Label, FormHelperText, FormErrorText } from '../ui/form';
import { Spinner } from '../ui/spinner';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../api/auth';
import { getErrorMessage } from '../api';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{phone?: string, password?: string}>({});
  const { login } = useAuth();

  const handleLogin = async () => {
    // Reset errors
    setErrors({});
    
    // Validation
    const newErrors: {phone?: string, password?: string} = {};
    
    if (!phoneNumber.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phoneNumber.trim().length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
    <Box className="flex-1">
      <StatusBar style="auto" />
      
      {/* Main Content with Gradient */}
      <GradientBackground>
        <VStack className="flex-1 px-6">
          
          {/* Spacer for top */}
          <Box className="flex-1" />
          
          {/* Header Section */}
          <VStack className="items-center mb-8">
            
            {/* Welcome Text */}
            <Text className="text-3xl text-white text-center mb-2 font-montserrat-bold">
              Welcome Back
            </Text>
            <Text className="text-lg text-white text-center opacity-90 font-montserrat-medium">
              Sign in to continue your journey
            </Text>
          </VStack>

          {/* Login Form Card - with height manipulation */}
          <Box className="bg-white rounded-3xl p-6 mx-2 shadow-lg h-148"> {/* Fixed height */}
            <VStack className="space-y-6">
              
              {/* Phone Number Input */}
              <FormControl isInvalid={!!errors.phone} isRequired>
                <Label>
                  <Text className="text-gray-900 font-montserrat-semibold text-base">
                    Phone Number
                  </Text>
                </Label>
                <View className="relative">
                  <View className="flex-row border-2 border-gray-200 focus:border-primary-500 rounded-xl bg-white h-14 items-center">
                    <View className="pl-4 pr-2 justify-center">
                      <Phone size={20} color="#6b7280" />
                    </View>
                    <Input
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChangeText={(text) => {
                        setPhoneNumber(text);
                        if (errors.phone) setErrors(prev => ({...prev, phone: undefined}));
                      }}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="flex-1 text-gray-900 text-base border-0 bg-transparent"
                    />
                  </View>
                </View>
                {errors.phone && (
                  <FormErrorText className="text-red-600">
                    {errors.phone}
                  </FormErrorText>
                )}
              </FormControl>

              {/* Password Input */}
              <FormControl isInvalid={!!errors.password}>
                <Label>
                  <Text className="text-gray-900 font-montserrat-semibold text-base">
                    Password
                  </Text>
                </Label>
                <View className="relative">
                  <View className="flex-row border-2 border-gray-200 focus:border-primary-500 rounded-xl bg-white h-14 items-center">
                    <View className="pl-4 pr-2 justify-center">
                      <Lock size={20} color="#6b7280" />
                    </View>
                    <Input
                      placeholder="Enter your password (optional)"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors(prev => ({...prev, password: undefined}));
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="flex-1 text-gray-900 text-base border-0 bg-transparent"
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      className="pr-4 pl-2 justify-center"
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#6b7280" />
                      ) : (
                        <Eye size={20} color="#6b7280" />
                      )}
                    </Pressable>
                  </View>
                </View>
                <FormHelperText className="text-gray-500 text-sm">
                  Leave empty if you don't have a password
                </FormHelperText>
                {errors.password && (
                  <FormErrorText className="text-red-600">
                    {errors.password}
                  </FormErrorText>
                )}
              </FormControl>

              {/* Login Button */}
              <Button
                onPress={handleLogin}
                disabled={loading || !phoneNumber.trim()}
                className="bg-primary-500 py-4 rounded-xl h-14 shadow-lg flex-row items-center justify-center"
              >
                {loading && <Spinner spinnerSize="small" color="white" className="mr-2" />}
                <Text className="text-white font-montserrat-bold text-lg">
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </Button>

              {/* Divider */}
              <HStack className="items-center">
                <Box className="flex-1 h-px bg-gray-200" />
                <Text className="mx-4 text-gray-500 font-montserrat-medium">or continue with</Text>
                <Box className="flex-1 h-px bg-gray-200" />
              </HStack>

              {/* Google Sign In Button */}
              <Button
                onPress={handleGoogleLogin}
                disabled={googleLoading}
                variant="outline"
                className="border-2 border-gray-200 py-4 rounded-xl h-14 bg-white flex-row items-center justify-center"
              >
                {googleLoading ? (
                  <Spinner spinnerSize="small" color="#f97316" className="mr-2" />
                ) : (
                  <Text className="text-2xl mr-3">🔍</Text>
                )}
                <Text className="text-gray-900 font-montserrat-semibold text-lg">
                  {googleLoading ? 'Connecting...' : 'Google'}
                </Text>
              </Button>
            </VStack>
          </Box>

          {/* Sign Up Link */}
          <VStack className="items-center mt-6 mb-4">
            <HStack className="items-center">
              <Text className="text-white font-montserrat-medium">Don't have an account? </Text>
              <Pressable>
                <Text className="text-orange-200 font-montserrat-bold underline">Sign Up</Text>
              </Pressable>
            </HStack>
          </VStack>
          
          {/* Spacer for bottom */}
          <Box className="flex-1" />
          
        </VStack>
      </GradientBackground>
    </Box>
  );
}
