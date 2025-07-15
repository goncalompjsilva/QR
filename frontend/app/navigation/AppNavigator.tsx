import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import Home from '../screens/Home';

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
    return <Home />;
  }

  // User is not authenticated, show login/register flow
  switch (navigationState) {
    case 'login':
      return (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={handleNavigateToRegister}
        />
      );
    case 'register':
      return (
        <RegisterScreen
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateToLogin={handleNavigateToLogin}
        />
      );
    default:
      return (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={handleNavigateToRegister}
        />
      );
  }
}
