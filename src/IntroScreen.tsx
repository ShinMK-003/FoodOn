// IntroScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

type IntroScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Intro'>;

type Props = {
  navigation: IntroScreenNavigationProp;
};

const IntroScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/Intro1.jpg')} style={styles.image} />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  button: {
    backgroundColor: '#e76e2e',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop:700,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  registerButton: {
    position: 'absolute',
    bottom: 40,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ffff', 
  },
  registerButtonText: {
    color: '#e76e2e', // Orange text color
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default IntroScreen;
