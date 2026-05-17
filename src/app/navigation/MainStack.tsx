import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Gift, FolderOpen, MessageCircle } from 'lucide-react-native';

// Импортируем экраны
import { HomePage } from '../../pages/main/HomePage';
import { DocumentsScreen } from '../../pages/main/DocumentsScreen';
import { ChatScreen } from '../../pages/main/ChatScreen';
import { wp, hp, getBottomSpace } from '../../shared/lib/responsive';
import { BonusShopScreen } from '../../pages/main/BonusShopScreen';
import { BalanceScreen } from '../../pages/main/BalanceScreen';
import { MyPurchasesScreen } from '../../pages/main/MyPurchasesScreen';
import { SettingsScreen } from '../../pages/main/SettingsScreen';

export type MainTabParamList = {
  Home: undefined;
  Chat: { draftMessage?: string } | undefined;
  Documents: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  BonusShop: undefined;
  Balance: undefined;
  MyPurchases: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const iconSize = wp(24);

/**
 * TabNavigator - нижние табы
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Gift size={iconSize} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <MessageCircle size={iconSize} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <FolderOpen size={iconSize} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * MainStack - основной стек навигации приложения
 * Содержит табы и дополнительные экраны
 */
export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="BonusShop" component={BonusShopScreen} />
      <Stack.Screen name="Balance" component={BalanceScreen} />
      <Stack.Screen name="MyPurchases" component={MyPurchasesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    height: hp(88) + getBottomSpace(),
    paddingTop: hp(12),
    paddingBottom: hp(12) + getBottomSpace(),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  tabIconContainer: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainerActive: {
    backgroundColor: '#E0F2FE',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
