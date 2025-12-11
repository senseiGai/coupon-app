import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { RootStackParamList } from '../../shared/types/navigation';

// Импортируем навигаторы и экраны
import AuthStack from './AuthStack';
import MainStack from './MainStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // Здесь можно добавить логику проверки авторизации
  const isAuthenticated = false; // Замените на реальную проверку

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {/* <Stack.Screen name="AuthStack" component={AuthStack} /> */}
      <Stack.Screen name="MainStack" component={MainStack} />
    </Stack.Navigator>
  );
}
