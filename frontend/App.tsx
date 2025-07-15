import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { 
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';
import { GluestackUIProvider } from './app/ui/gluestack-ui-provider';
import { AuthProvider } from './app/context/AuthContext';
import AppNavigator from './app/navigation/AppNavigator';
import { Spinner } from './app/ui/spinner';
import { Box } from './app/ui/box';
import './global.css';

export default function App(): React.JSX.Element {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });

  if (!fontsLoaded) {
    return (
      <GluestackUIProvider mode="system">
        <Box className="flex-1 bg-background-light dark:bg-background-dark justify-center items-center">
          <Spinner className="text-primary-500" size="large" />
        </Box>
      </GluestackUIProvider>
    );
  }

  return (
    <GluestackUIProvider mode="system">
      <AuthProvider>
        <View style={styles.container}>
          <AppNavigator />
          <StatusBar style="auto" />
        </View>
      </AuthProvider>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
