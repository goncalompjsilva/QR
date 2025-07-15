import React from 'react';
import {StyleSheet} from 'react-native';
import { Box } from '../ui/box';
import { Text } from '../ui/text';

const Home: React.FC = () => {
  return (
    <Box className="flex-1 justify-center items-center">
      <Text>Welcome to the Home Screen!</Text>
    </Box>
  );
};

export default Home;

const styles = StyleSheet.create({});
