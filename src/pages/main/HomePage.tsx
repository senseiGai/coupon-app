import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  useWindowDimensions,
  RefreshControl,
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
  Plane,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage, useLogout, useBonus } from '../../shared/lib/hooks';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AirplaneBackground } from '../../shared/ui/AirplaneBackground';
import {
  wp,
  hp,
  fontSize,
  sizes,
  responsive,
  isSmallDevice,
  isTablet,
} from '../../shared/lib/responsive';

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

export const HomePage = () => {
  const { t, language, setLanguage } = useLanguage();
  const logoutMutation = useLogout();
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const { balance, fetchBalance } = useBonus();
  const userBalance = balance?.available || 0;

  const [refreshing, setRefreshing] = useState(false);

  // Обновлять баланс при возврате на экран
  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, [fetchBalance])
  );

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBalance();
    setRefreshing(false);
  }, [fetchBalance]);

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
      <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0EA5E9']} />
          }>
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
                <Plane size={20} color="#FFFFFF" strokeWidth={2.5} />
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
              <Plane size={32} color="#FFD700" strokeWidth={2.5} />
              <Text style={styles.balanceBannerAmount}>{userBalance.toLocaleString()}</Text>
            </View>
            <Text style={styles.balanceBannerHint}>{t.main.home.hint}</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.main.home.quickActions}</Text>
          <View style={styles.singleCardContainer}>
            {/* Bonuses Card with Golden Gift Certificate Style */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.fullWidthCard}
              onPress={() => navigation.navigate('BonusShop')}>
              <LinearGradient
                colors={['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.goldenCertificateCard}>
                {/* Top Golden Ribbon */}
                <View style={styles.goldenRibbonTop}>
                  <View style={styles.ribbonSegment} />
                  <View style={styles.ribbonSegment} />
                  <View style={styles.ribbonSegment} />
                </View>

                {/* Main Content */}
                <View style={styles.certificateContent}>
                  {/* Gold Logo Image */}
                  <Image
                    source={require('../../../assets/gold_logo.png')}
                    style={styles.goldLogoImage}
                    resizeMode="cover"
                  />

                  {/* Text Content */}
                  <View style={styles.certificateTextContainer}>
                    <Text style={styles.certificateLabel}>{t.main.home.giftCertificate}</Text>
                    <Text style={styles.certificateTitle}>{t.main.home.bonuses}</Text>
                    <Text style={styles.certificateSubtitle}>{t.main.home.daily}</Text>
                  </View>
                </View>

                {/* Bottom Golden Ribbon with Bow */}
                <View style={styles.goldenRibbonBottom}>
                  <View style={styles.ribbonLine} />
                  <View style={styles.bowContainer}>
                    <View style={styles.bowLeft} />
                    <View style={styles.bowCenter} />
                    <View style={styles.bowRight} />
                  </View>
                </View>

                {/* Sparkles decoration */}
                <View style={styles.sparkleTopLeft}>
                  <Sparkles size={sparkleSize} color="#F59E0B" strokeWidth={2} />
                </View>
                <View style={styles.sparkleBottomRight}>
                  <Sparkles size={sparkleSize - 4} color="#FBBF24" strokeWidth={2} />
                </View>
              </LinearGradient>
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
                  <View style={styles.promoIconBlue}>
                    <MessageCircle size={promoIconSize} color="#0EA5E9" strokeWidth={2.5} />
                  </View>
                  <View style={styles.promoText}>
                    <Text style={styles.promoTitleDark}>{t.main.home.premiumTours}</Text>
                    <Text style={styles.promoSubtitleDark}>
                      {t.main.home.exclusiveDestinations}
                    </Text>
                  </View>
                </View>
                <View style={styles.sparkleIcon}>
                  <Sparkles size={sparkleSize} color="#0EA5E9" strokeWidth={2} />
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
                  <View style={styles.promoIconBlue}>
                    <FileText size={promoIconSize} color="#0EA5E9" strokeWidth={2.5} />
                  </View>
                  <View style={styles.promoText}>
                    <Text style={styles.promoTitleDark}>{t.main.home.flashDeals}</Text>
                    <Text style={styles.promoSubtitleDark}>{t.main.home.limitedTime}</Text>
                  </View>
                </View>
                <View style={styles.sparkleIcon}>
                  <Star size={sparkleSize} color="#0EA5E9" strokeWidth={2} fill="#0EA5E9" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={sizes.iconSM} color="#0EA5E9" strokeWidth={2.5} />
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
  goldenCertificateCard: {
    width: '100%',
    height: hp(180),
    borderRadius: wp(24),
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#FCD34D',
    position: 'relative',
  },
  goldenRibbonTop: {
    flexDirection: 'row',
    height: hp(12),
    backgroundColor: '#F59E0B',
  },
  ribbonSegment: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#D97706',
  },
  certificateContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
  },
  goldenCircle: {
    width: wp(80),
    height: wp(80),
    borderRadius: wp(40),
    backgroundColor: '#FCD34D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F59E0B',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  goldenCircleInner: {
    width: wp(68),
    height: wp(68),
    borderRadius: wp(34),
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  certificateTextContainer: {
    flex: 1,
    marginLeft: wp(16),
    justifyContent: 'center',
  },
  goldLogoImage: {
    width: wp(80),
    height: wp(80),
    borderRadius: wp(40),
  },
  certificateLabel: {
    fontSize: fontSize(13),
    fontWeight: '600',
    color: '#92400E',
    fontStyle: 'italic',
    marginBottom: hp(4),
    letterSpacing: 1,
  },
  certificateTitle: {
    fontSize: fontSize(24),
    fontWeight: '800',
    color: '#B45309',
    marginBottom: hp(4),
    textShadowColor: 'rgba(217, 119, 6, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  certificateSubtitle: {
    fontSize: fontSize(14),
    color: '#92400E',
    fontWeight: '600',
    opacity: 0.8,
  },
  goldenRibbonBottom: {
    height: hp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ribbonLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: '#F59E0B',
  },
  bowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bowLeft: {
    width: wp(20),
    height: hp(20),
    backgroundColor: '#F59E0B',
    borderRadius: wp(10),
    transform: [{ rotate: '-20deg' }],
  },
  bowCenter: {
    width: wp(12),
    height: hp(12),
    backgroundColor: '#D97706',
    borderRadius: wp(6),
    marginHorizontal: wp(2),
  },
  bowRight: {
    width: wp(20),
    height: hp(20),
    backgroundColor: '#F59E0B',
    borderRadius: wp(10),
    transform: [{ rotate: '20deg' }],
  },
  sparkleTopLeft: {
    position: 'absolute',
    top: hp(20),
    left: wp(16),
  },
  sparkleBottomRight: {
    position: 'absolute',
    bottom: hp(20),
    right: wp(16),
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
    marginHorizontal: wp(16),
    backgroundColor: '#FFFFFF',
    paddingVertical: hp(14),
    borderRadius: wp(16),
    gap: wp(10),
    shadowColor: '#0EA5E9',
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
