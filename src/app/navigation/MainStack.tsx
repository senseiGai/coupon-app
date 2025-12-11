import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Home, Palmtree, Wallet, FileText } from 'lucide-react-native';

// Импортируем экраны
import { HomePage } from '../../pages/main/HomePage';
import { BalanceScreen } from '../../pages/main/BalanceScreen';
import { ToursScreen } from '../../pages/main/ToursScreen';
import { DocumentsScreen } from '../../pages/main/DocumentsScreen';

export type MainTabParamList = {
  Home: undefined;
  Tours: undefined;
  Balance: undefined;
  Documents: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * MainStack - основной стек навигации приложения с табами
 */
export default function MainStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarLabel: 'Главная',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Home size={22} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Tours"
        component={ToursScreen}
        options={{
          tabBarLabel: 'Туры',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Palmtree size={22} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Balance"
        component={BalanceScreen}
        options={{
          tabBarLabel: 'Баланс',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Wallet size={22} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          tabBarLabel: 'Документы',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <FileText size={22} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    height: 85,
    paddingTop: 10,
    paddingBottom: 25,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  tabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainerActive: {
    backgroundColor: '#E0F2FE',
  },
});
