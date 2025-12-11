import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { MainStackParamList } from '../../shared/types/navigation';

// Импортируем экраны
import { HomePage } from '../../pages/main/HomePage';

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * MainStack - основной стек навигации приложения
 */
export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Home" component={HomePage} />
    </Stack.Navigator>
  );
}
