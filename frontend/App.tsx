import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Home from './app/screens/Home';
import { GluestackUIProvider } from './app/ui/gluestack-ui-provider';
import './global.css';

export default function App(): React.JSX.Element {
  return (
    <GluestackUIProvider mode="light">
      <View style={styles.container}>
        <Home />
        <StatusBar style="auto" />
      </View>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
