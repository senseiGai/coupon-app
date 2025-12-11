import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HomePage = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <Text>HomePage</Text>
      </View>
    </SafeAreaView>
  );
};
