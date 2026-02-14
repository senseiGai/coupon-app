import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { RootStackParamList } from '../../shared/types/navigation';
import { useIsAuthenticated } from '../../shared/lib/hooks';
import { authService } from '../../entities/auth/model/authService';

// Импортируем навигаторы и экраны
import AuthStack from './AuthStack';
import MainStack from './MainStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();

  // Автоматически обновляем токен при запуске приложения
  useEffect(() => {
    authService.refreshToken();
  }, []);

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
      initialRouteName={isAuthenticated ? 'MainStack' : 'AuthStack'}>
      {isAuthenticated ? (
        <Stack.Screen name="MainStack" component={MainStack} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
