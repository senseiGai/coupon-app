import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Gift, FolderOpen, MessageCircle } from 'lucide-react-native';

// Импортируем экраны
import { HomePage } from '../../pages/main/HomePage';
import { DocumentsScreen } from '../../pages/main/DocumentsScreen';
import { ChatScreen } from '../../pages/main/ChatScreen';

export type MainTabParamList = {
  Home: undefined;
  Documents: undefined;
  Chat: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ icon: Icon, focused }: { icon: any; focused: boolean }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Icon size={26} color={focused ? '#0EA5E9' : '#9CA3AF'} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
};

/**
 * MainStack - основной стек навигации приложения с табами
 */
export default function MainStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={Gift} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={FolderOpen} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={MessageCircle} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    height: Platform.OS === 'ios' ? 80 : 60,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
