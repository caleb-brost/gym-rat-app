import React from 'react';
import { Stack } from 'expo-router';

export default function WorkoutLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="active" 
        options={{ 
          headerShown: true,
          title: 'Active Workout',
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}
