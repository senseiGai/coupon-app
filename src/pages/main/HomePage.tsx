import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
<<<<<<< HEAD
  Image,
=======
  useWindowDimensions,
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Gift,
  Star,
  MessageCircle,
  FileText,
  Sparkles,
  LogOut,
  Languages,
  Coins,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage, useLogout } from '../../shared/lib/hooks';
<<<<<<< HEAD
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AirplaneBackground } from '../../shared/ui/AirplaneBackground';

type MainTabParamList = {
  Home: undefined;
  Chat: undefined;
  Documents: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
  BonusShop: undefined;
  Balance: undefined;
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;
const CARD_WIDTH = (width - 48) / 2;
=======
import {
  wp,
  hp,
  fontSize,
  sizes,
  responsive,
  isSmallDevice,
  isTablet,
} from '../../shared/lib/responsive';
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)

export const HomePage = () => {
  const { t, language, setLanguage } = useLanguage();
  const logoutMutation = useLogout();
<<<<<<< HEAD
  const navigation = useNavigation<NavigationProp>();
=======
  const { width } = useWindowDimensions();
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)
  const userBalance = 2450;

  // Адаптивные размеры на основе текущей ширины экрана
  const BANNER_WIDTH = width - wp(32);
  const iconSize = responsive({ xs: 28, sm: 32, lg: 36, default: 32 });
  const promoIconSize = responsive({ xs: 30, sm: 36, lg: 40, default: 36 });
  const sparkleSize = responsive({ xs: 20, sm: 24, lg: 28, default: 24 });

  const toggleLanguage = () => {
    if (language === 'en') {
      setLanguage('ru');
    } else if (language === 'ru') {
      setLanguage('uk');
    } else {
      setLanguage('en');
    }
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'en':
        return 'EN';
      case 'ru':
        return 'РУ';
      case 'uk':
        return 'УК';
      default:
        return 'EN';
    }
  };

  const handleLogout = async () => {
    Alert.alert(t.common.logout, t.common.logoutConfirm, [
      {
        text: t.common.cancel,
        onPress: () => console.log('Logout cancelled'),
        style: 'cancel',
      },
      {
        text: t.common.logout,
        onPress: async () => {
          try {
            console.log('[HomePage] Logging out...');
            await logoutMutation.mutateAsync();
            console.log(
              '[HomePage] Logout successful, QueryClient cleared, RootNavigator will automatically switch to AuthStack'
            );
            // RootNavigator автоматически переключится на AuthStack когда увидит отсутствие токена
          } catch (error) {
            console.error('[HomePage] Logout error:', error);
            Alert.alert(t.common.error, t.common.logoutFailed);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AirplaneBackground />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t.main.home.greeting}</Text>
            <Text style={styles.subtitle}>{t.main.home.subtitle}</Text>
          </View>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={toggleLanguage}
            activeOpacity={0.7}>
            <Languages size={sizes.iconMD} color="#0EA5E9" strokeWidth={2} />
            <Text style={styles.languageText}>{getLanguageLabel()}</Text>
          </TouchableOpacity>
        </View>

        {/* Main Banner - Balance Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.bannerSection}
          onPress={() => navigation.navigate('Balance')}>
          <View style={styles.balanceBanner}>
            <View style={styles.balanceBannerHeader}>
              <View style={styles.balanceLabelRow}>
                <Coins size={20} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.balanceBannerLabel}>{t.main.home.balance}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.watchAdButton}
                onPress={() => navigation.navigate('Balance')}>
                <Text style={styles.watchAdText}>{t.main.home.watchAds}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.balanceAmountRow}>
              <Coins size={32} color="#FFD700" strokeWidth={2.5} />
              <Text style={styles.balanceBannerAmount}>{userBalance.toLocaleString()}</Text>
            </View>
            <Text style={styles.balanceBannerHint}>{t.main.home.hint}</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.main.home.quickActions}</Text>
          <View style={styles.singleCardContainer}>
<<<<<<< HEAD
            {/* Bonuses - Blue */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.fullWidthCard}
              onPress={() => navigation.navigate('BonusShop')}>
              <View style={styles.cardSolid}>
                <View style={styles.cardIconWithLogo}>
                  <Image
                    source={require('../../../assets/logo.jpg')}
                    style={styles.goldenLogo}
                    resizeMode="contain"
                  />
=======
            {/* Bonuses - Orange */}
            <TouchableOpacity activeOpacity={0.8} style={styles.fullWidthCard}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}>
                <View style={styles.cardIcon}>
                  <Gift size={iconSize} color="#FFFFFF" strokeWidth={2.5} />
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)
                </View>
                <Text style={styles.cardTitle}>{t.main.home.bonuses}</Text>
                <Text style={styles.cardSubtitle}>{t.main.home.daily}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promotional Banners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.main.home.specialOffers}</Text>

          {/* White-Blue Banner - Chat */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.promoBanner}
            onPress={() => navigation.navigate('Chat')}>
            <LinearGradient
              colors={['#FFFFFF', '#E0F2FE', '#7DD3FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerGradient}>
              <View style={styles.promoContent}>
                <View style={styles.promoLeft}>
<<<<<<< HEAD
                  <View style={styles.promoIconBlue}>
                    <MessageCircle size={36} color="#0EA5E9" strokeWidth={2.5} />
=======
                  <View style={styles.promoIcon}>
                    <Crown size={promoIconSize} color="#FFFFFF" strokeWidth={2.5} />
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)
                  </View>
                  <View style={styles.promoText}>
                    <Text style={styles.promoTitleDark}>{t.main.home.premiumTours}</Text>
                    <Text style={styles.promoSubtitleDark}>
                      {t.main.home.exclusiveDestinations}
                    </Text>
                  </View>
                </View>
                <View style={styles.sparkleIcon}>
<<<<<<< HEAD
                  <Sparkles size={24} color="#0EA5E9" strokeWidth={2} />
=======
                  <Sparkles size={sparkleSize} color="#FFFFFF" strokeWidth={2} />
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* White-Blue Banner - Documents */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.promoBanner}
            onPress={() => navigation.navigate('Documents')}>
            <LinearGradient
              colors={['#FFFFFF', '#E0F2FE', '#7DD3FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerGradient}>
              <View style={styles.promoContent}>
                <View style={styles.promoLeft}>
<<<<<<< HEAD
                  <View style={styles.promoIconBlue}>
                    <FileText size={36} color="#0EA5E9" strokeWidth={2.5} />
=======
                  <View style={styles.promoIcon}>
                    <Zap size={promoIconSize} color="#FFFFFF" strokeWidth={2.5} />
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)
                  </View>
                  <View style={styles.promoText}>
                    <Text style={styles.promoTitleDark}>{t.main.home.flashDeals}</Text>
                    <Text style={styles.promoSubtitleDark}>{t.main.home.limitedTime}</Text>
                  </View>
                </View>
                <View style={styles.sparkleIcon}>
<<<<<<< HEAD
                  <Star size={24} color="#0EA5E9" strokeWidth={2} fill="#0EA5E9" />
=======
                  <Star size={sparkleSize} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleLogout} style={styles.logoutButton}>
<<<<<<< HEAD
            <LogOut size={20} color="#0EA5E9" strokeWidth={2.5} />
=======
            <LogOut size={wp(20)} color="#FFFFFF" strokeWidth={2.5} />
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)
            <Text style={styles.logoutButtonText}>{t.common.logout}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: hp(140) }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: wp(16),
    paddingTop: hp(16),
    paddingBottom: hp(8),
  },
  greeting: {
    fontSize: fontSize(28),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp(4),
  },
  subtitle: {
    fontSize: fontSize(15),
    color: '#64748B',
    fontWeight: '500',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
    borderRadius: wp(16),
    gap: wp(6),
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  languageText: {
    fontSize: fontSize(14),
    fontWeight: '700',
    color: '#0EA5E9',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp(16),
    paddingVertical: hp(10),
    borderRadius: wp(16),
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: fontSize(11),
    color: '#64748B',
    fontWeight: '600',
    marginBottom: hp(2),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: fontSize(20),
    fontWeight: '700',
    color: '#0EA5E9',
  },
  bannerSection: {
    paddingHorizontal: wp(16),
    paddingTop: hp(16),
  },
  balanceBanner: {
    width: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: wp(20),
    paddingHorizontal: wp(20),
    paddingVertical: hp(20),
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(12),
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceBannerLabel: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  watchAdButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: wp(14),
    paddingVertical: hp(8),
    borderRadius: wp(18),
  },
  watchAdText: {
    fontSize: fontSize(13),
    fontWeight: '600',
    color: '#0EA5E9',
  },
  balanceBannerAmount: {
    fontSize: responsive({ xs: fontSize(32), sm: fontSize(36), default: fontSize(40) }),
    fontWeight: '700',
    color: '#FFFFFF',
<<<<<<< HEAD
=======
    marginBottom: hp(6),
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)
  },
  balanceBannerHint: {
    fontSize: fontSize(14),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  section: {
    paddingTop: hp(24),
  },
  sectionTitle: {
    fontSize: fontSize(20),
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: wp(16),
    marginBottom: hp(12),
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: wp(16),
    gap: wp(12),
    justifyContent: 'space-between',
  },
  singleCardContainer: {
    paddingHorizontal: wp(16),
  },
  actionCard: {
    flex: 1,
    minWidth: wp(150),
    marginBottom: hp(4),
  },
  fullWidthCard: {
    width: '100%',
  },
  cardGradient: {
    width: '100%',
    height: hp(140),
    borderRadius: wp(20),
    padding: wp(16),
    justifyContent: 'space-between',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  cardSolid: {
    width: '100%',
    height: 140,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  cardIcon: {
    width: wp(56),
    height: wp(56),
    borderRadius: wp(16),
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconWithLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  goldenLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  cardTitle: {
    fontSize: fontSize(17),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: hp(2),
  },
  cardTitleDark: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: fontSize(13),
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  cardSubtitleDark: {
    fontSize: 13,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  promoBanner: {
    marginHorizontal: wp(16),
    marginTop: hp(12),
  },
  bannerGradient: {
    width: '100%',
    minHeight: hp(100),
    borderRadius: wp(20),
    overflow: 'hidden',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  promoContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promoIcon: {
    width: wp(56),
    height: wp(56),
    borderRadius: wp(16),
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(14),
  },
  promoIconBlue: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: fontSize(17),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: hp(3),
  },
  promoTitleDark: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 3,
  },
  promoSubtitle: {
    fontSize: fontSize(13),
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  promoSubtitleDark: {
    fontSize: 13,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  sparkleIcon: {
    marginLeft: wp(12),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
<<<<<<< HEAD
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#0EA5E9',
=======
    marginHorizontal: wp(16),
    backgroundColor: '#EF4444',
    paddingVertical: hp(14),
    borderRadius: wp(16),
    gap: wp(10),
    shadowColor: '#EF4444',
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  logoutButtonText: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: '#0EA5E9',
  },
});
