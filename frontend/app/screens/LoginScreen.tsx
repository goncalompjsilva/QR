import React, { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import { QrCode, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Box } from '../ui/box';
import { VStack } from '../ui/vstack';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { Button, ButtonText, ButtonIcon } from '../ui/button';
import { Input, InputField } from '../ui/input';
import { 
  FormControl, 
  FormControlLabel, 
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon
} from '../ui/form-control';
import { Spinner } from '../ui/spinner';
import { Pressable } from '../ui/pressable';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../api/auth';
import { getErrorMessage } from '../api';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { colorScheme } = useColorScheme();
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

  // Define gradient colors based on theme (similar to SplashScreen)
  const gradientColors: [string, string, string] = colorScheme === 'dark' 
    ? ['#ff6b35','#ffa726', '#ffa726'] // primary-900 to primary-800
    : ['#ff6b35', '#ffa726', '#ffa726']; // primary-50 to primary-100

  return (
    <Box className="flex-1">
      <StatusBar style="auto" />
      
      {/* Main Content with Gradient */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, width: '100%' }}
      >
        <VStack className="flex-1 px-6">
          
          {/* Spacer for top */}
          <Box className="flex-1" />
          
          {/* Header Section */}
          <VStack className="items-center mb-8">
            
            {/* Welcome Text */}
            <Text className="text-3xl text-typography-0 text-center mb-2 font-montserrat-bold">
              Welcome Back
            </Text>
            <Text className="text-lg text-typography-0 text-center opacity-90 font-montserrat-medium">
              Sign in to continue your journey
            </Text>
          </VStack>

          {/* Login Form Card */}
          <Box className="bg-primary-0 rounded-3xl p-6 mx-2 shadow-soft-3">
            <VStack className="space-y-6">
              
              {/* Phone Number Input */}
              <FormControl isInvalid={!!errors.phone} isRequired>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-900 font-semibold text-base">
                    Phone Number
                  </FormControlLabelText>
                </FormControlLabel>
                <Box className="relative">
                  <Input className="border-2 border-outline-200 focus:border-primary-500 rounded-xl bg-background-0 h-14">
                    <Box className="pl-4 pr-2 justify-center">
                      <Phone size={20} color="#6b7280" />
                    </Box>
                    <InputField
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChangeText={(text) => {
                        setPhoneNumber(text);
                        if (errors.phone) setErrors(prev => ({...prev, phone: undefined}));
                      }}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="flex-1 text-typography-900 text-base"
                    />
                  </Input>
                </Box>
                {errors.phone && (
                  <FormControlError>
                    <FormControlErrorText className="text-error-600">
                      {errors.phone}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Password Input */}
              <FormControl isInvalid={!!errors.password}>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-900 font-semibold text-base">
                    Password
                  </FormControlLabelText>
                </FormControlLabel>
                <Box className="relative">
                  <Input className="border-2 border-outline-200 focus:border-primary-500 rounded-xl bg-background-0 h-14">
                    <Box className="pl-4 pr-2 justify-center">
                      <Lock size={20} color="#6b7280" />
                    </Box>
                    <InputField
                      placeholder="Enter your password (optional)"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors(prev => ({...prev, password: undefined}));
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="flex-1 text-typography-900 text-base"
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
                  </Input>
                </Box>
                <FormControlHelper>
                  <FormControlHelperText className="text-typography-500 text-sm">
                    Leave empty if you don't have a password
                  </FormControlHelperText>
                </FormControlHelper>
                {errors.password && (
                  <FormControlError>
                    <FormControlErrorText className="text-error-600">
                      {errors.password}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Login Button */}
              <Button
                onPress={handleLogin}
                disabled={loading || !phoneNumber.trim()}
                className="bg-primary-500 py-4 rounded-xl h-14 shadow-soft-1"
                action="primary"
                size="lg"
              >
                {loading && <Spinner className="text-white mr-2" size="small" />}
                <ButtonText className="text-white font-bold text-lg">
                  {loading ? 'Signing In...' : 'Sign In'}
                </ButtonText>
              </Button>

              {/* Divider */}
              <HStack className="items-center">
                <Box className="flex-1 h-px bg-outline-200" />
                <Text className="mx-4 text-typography-500 font-medium">or continue with</Text>
                <Box className="flex-1 h-px bg-outline-200" />
              </HStack>

              {/* Google Sign In Button */}
              <Button
                onPress={handleGoogleLogin}
                disabled={googleLoading}
                variant="outline"
                className="border-2 border-outline-200 py-4 rounded-xl h-14 bg-background-0"
                size="lg"
              >
                {googleLoading ? (
                  <Spinner className="text-primary-500 mr-2" size="small" />
                ) : (
                  <Text className="text-2xl mr-3">🔍</Text>
                )}
                <ButtonText className="text-typography-900 font-semibold text-lg">
                  {googleLoading ? 'Connecting...' : 'Google'}
                </ButtonText>
              </Button>
            </VStack>
          </Box>

          {/* Sign Up Link */}
          <VStack className="items-center mt-6 mb-4">
            <HStack className="items-center">
              <Text className="text-typography-0 font-medium">Don't have an account? </Text>
              <Pressable>
                <Text className="text-primary-200 font-bold underline">Sign Up</Text>
              </Pressable>
            </HStack>
          </VStack>
          
          {/* Spacer for bottom */}
          <Box className="flex-1" />
          
        </VStack>
      </LinearGradient>
    </Box>
  );
}
