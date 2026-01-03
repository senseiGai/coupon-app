import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gift, Star, Zap, Crown, Sparkles, LogOut, Languages } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage, useLogout } from '../../shared/lib/hooks';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;
const CARD_WIDTH = (width - 48) / 2;

export const HomePage = () => {
  const { t, language, setLanguage } = useLanguage();
  const logoutMutation = useLogout();
  const userBalance = 2450;

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
            <Languages size={24} color="#0EA5E9" strokeWidth={2} />
            <Text style={styles.languageText}>{getLanguageLabel()}</Text>
          </TouchableOpacity>
        </View>

        {/* Main Banner - Balance Card */}
        <View style={styles.bannerSection}>
          <View style={styles.balanceBanner}>
            <View style={styles.balanceBannerHeader}>
              <Text style={styles.balanceBannerLabel}>{t.main.home.balance}</Text>
              <TouchableOpacity activeOpacity={0.8} style={styles.watchAdButton}>
                <Text style={styles.watchAdText}>{t.main.home.watchAds}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceBannerAmount}>{userBalance.toLocaleString()}</Text>
            <Text style={styles.balanceBannerHint}>{t.main.home.hint}</Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.main.home.quickActions}</Text>
          <View style={styles.singleCardContainer}>
            {/* Bonuses - Orange */}
            <TouchableOpacity activeOpacity={0.8} style={styles.fullWidthCard}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}>
                <View style={styles.cardIcon}>
                  <Gift size={32} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={styles.cardTitle}>{t.main.home.bonuses}</Text>
                <Text style={styles.cardSubtitle}>{t.main.home.daily}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promotional Banners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.main.home.specialOffers}</Text>

          {/* Purple Banner */}
          <TouchableOpacity activeOpacity={0.9} style={styles.promoBanner}>
            <LinearGradient
              colors={['#A855F7', '#9333EA', '#7E22CE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerGradient}>
              <View style={styles.promoContent}>
                <View style={styles.promoLeft}>
                  <View style={styles.promoIcon}>
                    <Crown size={36} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <View style={styles.promoText}>
                    <Text style={styles.promoTitle}>{t.main.home.premiumTours}</Text>
                    <Text style={styles.promoSubtitle}>{t.main.home.exclusiveDestinations}</Text>
                  </View>
                </View>
                <View style={styles.sparkleIcon}>
                  <Sparkles size={24} color="#FFFFFF" strokeWidth={2} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Teal Banner */}
          <TouchableOpacity activeOpacity={0.9} style={styles.promoBanner}>
            <LinearGradient
              colors={['#14B8A6', '#0D9488', '#0F766E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerGradient}>
              <View style={styles.promoContent}>
                <View style={styles.promoLeft}>
                  <View style={styles.promoIcon}>
                    <Zap size={36} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <View style={styles.promoText}>
                    <Text style={styles.promoTitle}>{t.main.home.flashDeals}</Text>
                    <Text style={styles.promoSubtitle}>{t.main.home.limitedTime}</Text>
                  </View>
                </View>
                <View style={styles.sparkleIcon}>
                  <Star size={24} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.logoutButtonText}>{t.common.logout}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 140 }} />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  bannerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  balanceBanner: {
    width: BANNER_WIDTH,
    backgroundColor: '#38BDF8',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    marginBottom: 12,
  },
  balanceBannerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  watchAdButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  watchAdText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  balanceBannerAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  balanceBannerHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  section: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  singleCardContainer: {
    paddingHorizontal: 16,
  },
  actionCard: {
    width: CARD_WIDTH,
    marginBottom: 4,
  },
  fullWidthCard: {
    width: '100%',
  },
  cardGradient: {
    width: '100%',
    height: 140,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  bannerGradient: {
    width: '100%',
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  promoContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  promoSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  sparkleIcon: {
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
