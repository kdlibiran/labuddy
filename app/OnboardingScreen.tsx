import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, Image } from 'react-native';
import { Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import logo from '../assets/logo.png'
import React from 'react';
import { styled } from '@gluestack-style/react';

const StyledSafeAreaView = styled(SafeAreaView, {
  h: '100%'
})
const StyledView = styled(View, {
  w: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  h: '100%',
  paddingHorizontal: 4
})
const StyledImage = styled(Image, {
  w: 130,
  h: 84
})

export default function OnboardingScreen() {
  return (
    <StyledSafeAreaView>
      <ScrollView contentContainerStyle={{ height: '100%'}}>
        <StyledView>
          <StyledImage
            source={logo}
            resizeMode="contain"
          />
        </StyledView>
      </ScrollView>
    </StyledSafeAreaView>
  );
}
