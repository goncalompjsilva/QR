import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Box } from '../ui/box';
import { VStack } from '../ui/vstack';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { useAuth } from '../context/AuthContext';
import { api, useApi, getErrorMessage } from '../api';

const Home: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const { user, logout } = useAuth();

  // Example using the useApi hook
  const { data, loading, error, execute } = useApi('/health', 'GET', {
    immediate: false, // Don't call automatically
    onSuccess: (data) => {
      console.log('Health check successful:', data);
    },
    onError: (error) => {
      console.error('Health check failed:', error);
    }
  });

  // Example manual API call
  const testConnection = async () => {
    try {
      setTestResult('Testing connection...');
      const response = await api.get('/health');
      setTestResult(`Connection successful! Status: ${response.status}`);
      Alert.alert('Success', 'Connected to backend successfully!');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setTestResult(`Connection failed: ${errorMsg}`);
      Alert.alert('Error', `Failed to connect to backend: ${errorMsg}`);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  return (
    <Box className="flex-1 bg-background-light dark:bg-background-dark">
      <VStack className="flex-1 px-6 pt-16">
        {/* Welcome Section */}
        <VStack className="items-center mb-8">
          <Text className="text-3xl font-bold text-typography-900 mb-2">
            Welcome, {user?.full_name || 'User'}! 👋
          </Text>
          <Text className="text-typography-600 text-center">
            Phone: {user?.phone_number}
          </Text>
          {user?.email && (
            <Text className="text-typography-600 text-center">
              Email: {user.email}
            </Text>
          )}
        </VStack>

        {/* API Testing Section */}
        <VStack className="space-y-4 mb-8">
          <Text className="text-xl font-semibold text-typography-900 text-center">
            Backend Connection Test
          </Text>
          
          <Text className="text-base text-center text-typography-600">
            Backend URL: http://localhost:8000
          </Text>
          
          <Button 
            onPress={testConnection}
            className="bg-primary-500 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Test Backend Connection</Text>
          </Button>

          <Button 
            onPress={() => execute()}
            disabled={loading}
            variant="outline"
            className="border-primary-500 py-3 rounded-lg"
          >
            <Text className="text-primary-500 font-semibold">
              {loading ? 'Loading...' : 'Test with Hook'}
            </Text>
          </Button>

          {/* Results */}
          {testResult && (
            <Box className="bg-background-100 p-4 rounded-lg">
              <Text className="text-sm text-center text-typography-700">{testResult}</Text>
            </Box>
          )}

          {data && (
            <Box className="bg-success-50 p-4 rounded-lg">
              <Text className="text-sm text-success-700 text-center">
                Hook result: {JSON.stringify(data)}
              </Text>
            </Box>
          )}

          {error && (
            <Box className="bg-error-50 p-4 rounded-lg">
              <Text className="text-sm text-error-700 text-center">
                Hook error: {error}
              </Text>
            </Box>
          )}
        </VStack>

        {/* Logout Button */}
        <VStack className="mt-auto mb-8">
          <Button 
            onPress={handleLogout}
            variant="outline"
            className="border-error-500 py-3 rounded-lg"
          >
            <Text className="text-error-500 font-semibold">Logout</Text>
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Home;

const styles = StyleSheet.create({});
