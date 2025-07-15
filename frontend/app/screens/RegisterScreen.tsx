import React, { useState } from 'react';
import { Alert } from 'react-native';
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
import { getErrorMessage } from '../api';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }: RegisterScreenProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (password && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (password && password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        email: email.trim() || undefined,
        password: password || undefined,
      });

      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: onRegisterSuccess }
      ]);
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar style="auto" />
      
      <VStack className="flex-1 px-6 pt-16">
        {/* Header */}
        <VStack className="items-center mb-8">
          <Box className="w-20 h-20 bg-primary-500 rounded-2xl mb-4 justify-center items-center">
            <Text className="text-4xl">📱</Text>
          </Box>
          <Text className="text-3xl font-bold text-typography-900 mb-2">
            Create Account
          </Text>
          <Text className="text-typography-600 text-center">
            Join us to start scanning and ordering
          </Text>
        </VStack>

        {/* Registration Form */}
        <VStack className="space-y-4 mb-8">
          {/* Full Name Input */}
          <FormControl>
            <Text className="text-typography-700 font-medium mb-2">
              Full Name *
            </Text>
            <Input className="border-outline-300 focus:border-primary-500">
              <InputField
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </Input>
          </FormControl>

          {/* Phone Number Input */}
          <FormControl>
            <Text className="text-typography-700 font-medium mb-2">
              Phone Number *
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

          {/* Email Input */}
          <FormControl>
            <Text className="text-typography-700 font-medium mb-2">
              Email (Optional)
            </Text>
            <Input className="border-outline-300 focus:border-primary-500">
              <InputField
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
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
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Input>
            <Text className="text-typography-500 text-sm mt-1">
              Leave empty to use phone verification only
            </Text>
          </FormControl>

          {/* Confirm Password Input */}
          {password.length > 0 && (
            <FormControl>
              <Text className="text-typography-700 font-medium mb-2">
                Confirm Password
              </Text>
              <Input className="border-outline-300 focus:border-primary-500">
                <InputField
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Input>
            </FormControl>
          )}

          {/* Register Button */}
          <Button
            onPress={handleRegister}
            disabled={loading || !fullName.trim() || !phoneNumber.trim()}
            className="bg-primary-500 py-4 rounded-lg mt-6"
          >
            {loading ? (
              <HStack className="items-center">
                <Spinner className="text-white mr-2" size="small" />
                <Text className="text-white font-semibold">Creating Account...</Text>
              </HStack>
            ) : (
              <Text className="text-white font-semibold text-lg">Create Account</Text>
            )}
          </Button>
        </VStack>

        {/* Sign In Link */}
        <VStack className="items-center mb-8">
          <HStack className="items-center">
            <Text className="text-typography-600">Already have an account? </Text>
            <Pressable onPress={onNavigateToLogin}>
              <Text className="text-primary-500 font-semibold">Sign In</Text>
            </Pressable>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
}
