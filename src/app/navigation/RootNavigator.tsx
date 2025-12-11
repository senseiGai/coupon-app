import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { RootStackParamList } from '../../shared/types/navigation';

// Импортируем навигаторы и экраны
import MainStack from './MainStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="MainStack" component={MainStack} />
    </Stack.Navigator>
  );
}
