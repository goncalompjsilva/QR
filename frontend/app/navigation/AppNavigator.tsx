import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import { Text } from '../ui/text';

type NavigationState = 'login' | 'register';

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [navigationState, setNavigationState] = useState<NavigationState>('login');

  const handleNavigateToRegister = () => {
    setNavigationState('register');
  };

  const handleNavigateToLogin = () => {
    setNavigationState('login');
  };

  const handleLoginSuccess = () => {
    // Navigation is handled by the auth context
  };

  const handleRegisterSuccess = () => {
    // Navigation is handled by the auth context
  };

  const handleAuthenticationCheck = (isAuthenticated: boolean) => {
    // This is handled by the auth context now
  };

  if (isLoading) {
    return <SplashScreen onAuthenticationCheck={handleAuthenticationCheck} />;
  }

  if (isAuthenticated) {
    return <Text>Authenticated User Screen</Text>; // Replace with your authenticated user screen component
  }

  // User is not authenticated, show login/register flow
  switch (navigationState) {
    case 'login':
      return (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      );
    case 'register':
      return (
        <Text>Register Screen</Text>
      );
    default:
      return (
        <Text>Unknown State</Text>
      );
  }
}
