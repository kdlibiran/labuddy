import { Stack } from 'expo-router';
import React from 'react';
export default function Layout() {
  return <Stack screenOptions={{
    headerStyle: {
      backgroundColor: '#028391',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}>
    <Stack.Screen name="index" options={{title: 'Sign Up'}} />
    <Stack.Screen name="Dashboard" options={{headerLeft: () => null}} />
  </Stack>; 
}
