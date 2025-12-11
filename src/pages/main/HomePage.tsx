import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gift, Play, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../app/navigation/MainStack';
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = BottomTabNavigationProp<MainTabParamList>;

export const HomePage = () => {
  const navigation = useNavigation<NavigationProp>();
  const balance = 2450;

  const handlePlayAd = () => {
    Alert.alert('🎥', `TV: ${balance}\nСмотрите рекламу, чтобы заработать больше TV`, [
      { text: 'OK' },
    ]);
  };

  const handleGiftPress = () => {
    Alert.alert('🎁', 'Ваши бонусы и подарки', [{ text: 'OK' }]);
  };

  const handleCertificatePress = (discount: string, cost: string) => {
    Alert.alert(
      discount,
      `Стоимость: ${cost}\n\nОбменяйте TV на сертификаты с выгодными скидками!`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Обменять', onPress: () => Alert.alert('✅', 'Сертификат активирован!') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card with Gradient */}
        <View style={styles.balanceSection}>
          <TouchableOpacity activeOpacity={0.9} onPress={handlePlayAd}>
            <LinearGradient
              colors={['#06B6D4', '#0EA5E9', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <View style={styles.playBadge}>
                  <Play size={20} color="#FFFFFF" strokeWidth={3} fill="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.balanceAmount}>{balance.toLocaleString()}</Text>
              <Text style={styles.balanceCurrency}>TV</Text>
              <View style={styles.shimmer} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Gift Button - Бонусы с градиентом */}
        <View style={styles.giftSection}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleGiftPress}>
            <LinearGradient
              colors={['#FCD34D', '#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.giftButton}>
              <Gift size={40} color="#FFFFFF" strokeWidth={2.5} />
              <Sparkles size={18} color="#FFFFFF" strokeWidth={2} style={styles.sparkleIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Сертификаты с яркими градиентами */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.certificatesScrollContent}
          style={styles.certificatesScroll}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleCertificatePress('10%', '1 TV')}
            style={styles.certificateWrapper}>
            <LinearGradient
              colors={['#10B981', '#059669', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.certificateCard}>
              <View style={styles.certificateTop}>
                <Sparkles size={20} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text style={styles.certificateDiscount}>10%</Text>
              <View style={styles.certificateBottom}>
                <Text style={styles.certificateTv}>1 TV</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleCertificatePress('50%', '5 TV')}
            style={styles.certificateWrapper}>
            <LinearGradient
              colors={['#EC4899', '#DB2777', '#BE185D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.certificateCard}>
              <View style={styles.certificateTop}>
                <Sparkles size={20} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text style={styles.certificateDiscount}>50%</Text>
              <View style={styles.certificateBottom}>
                <Text style={styles.certificateTv}>5 TV</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleCertificatePress('🎁', '10 TV')}
            style={styles.certificateWrapper}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.certificateCard}>
              <View style={styles.certificateTop}>
                <Sparkles size={20} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={styles.certificateIconContainer}>
                <Gift size={48} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.certificateBottom}>
                <Text style={styles.certificateTvFree}>10 TV</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  balanceSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  balanceCard: {
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  balanceHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  playBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  balanceAmount: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  balanceCurrency: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 8,
    letterSpacing: 6,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  giftSection: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 20,
  },
  giftButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  sparkleIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  certificatesScroll: {
    marginTop: 32,
  },
  certificatesScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 20,
  },
  certificateWrapper: {
    marginRight: 12,
  },
  certificateCard: {
    width: 140,
    height: 160,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
    overflow: 'hidden',
  },
  certificateTop: {
    width: '100%',
    alignItems: 'flex-end',
  },
  certificateIconContainer: {
    marginTop: 4,
  },
  certificateDiscount: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  certificateBottom: {
    width: '100%',
    alignItems: 'center',
  },
  certificateTv: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  certificateTvFree: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.95)',
  },
});
