// import {
//   Montserrat_400Regular,
//   Montserrat_500Medium,
//   Montserrat_600SemiBold,
// } from '@expo-google-fonts/montserrat';
import { useFonts } from 'expo-font';
// import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './global.css';

import RootNavigator from '@/app/navigation/RootNavigator';

// Prevent the splash screen from auto-hiding
// SplashScreen.preventAutoHideAsync();

export default function App() {
  // const [fontsLoaded] = useFonts({
  //   'Montserrat-Regular': Montserrat_400Regular,
  //   'Montserrat-Medium': Montserrat_500Medium,
  //   'Montserrat-SemiBold': Montserrat_600SemiBold,
  // });

  // useEffect(() => {
  //   if (fontsLoaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded]);

  // if (!fontsLoaded) {
  //   return null;
  // }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
