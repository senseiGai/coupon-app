import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Gift, Plane, Star, ShoppingCart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage, useBonus } from '@/shared/lib/hooks';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/navigation/MainStack';
import { AirplaneBackground } from '@/shared/ui/AirplaneBackground';
import { TwaRewardsGrid } from '@/features/twa-rewards/ui/TwaRewardsGrid';
import { formatTwaAmount } from '@/shared/constants/adRewards';

export const BonusShopScreen = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { balance, loading, fetchBalance } = useBonus();
  const userBalance = balance?.available ?? 0;

  useFocusEffect(
    useCallback(() => {
      void fetchBalance();
    }, [fetchBalance]),
  );

  if (loading && !balance) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AirplaneBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AirplaneBackground />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.bonusShop.title}</Text>
          <View style={styles.balanceChip}>
            <Plane size={16} color="#FFD700" />
            <Text style={styles.balanceText}>{formatTwaAmount(userBalance)}</Text>
          </View>
        </View>

        <View style={styles.myBonusesRow}>
          <Gift size={20} color="#F59E0B" />
          <Text style={styles.myBonusesText}>{t.bonusShop.myBonuses}</Text>
          <Text style={styles.myBonusesAmount}>{formatTwaAmount(userBalance)}</Text>
        </View>

        <View style={styles.infoBanner}>
          <LinearGradient
            colors={['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoBannerGradient}>
            <View style={styles.decorativeRibbonTop}>
              <View style={styles.ribbonPiece} />
              <View style={styles.ribbonPiece} />
              <View style={styles.ribbonPiece} />
            </View>
            <View style={styles.infoBannerContent}>
              <View style={styles.infoBannerIcon}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.infoBannerText}>
                <Text style={styles.infoBannerTitle}>{t.bonusShop.spendBonuses}</Text>
                <Text style={styles.infoBannerSubtitle}>{t.bonusShop.chooseReward}</Text>
              </View>
              <Star size={28} color="#F59E0B" strokeWidth={2} fill="#FBBF24" />
            </View>
            <View style={styles.decorativeRibbonBottom} />
          </LinearGradient>
        </View>

        <TouchableOpacity
          style={styles.myPurchasesButton}
          onPress={() => navigation.navigate('MyPurchases')}>
          <ShoppingCart size={20} color="#0EA5E9" />
          <Text style={styles.myPurchasesButtonText}>{t.bonusShop.myPurchases}</Text>
          <ArrowLeft size={16} color="#64748B" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        <View style={styles.rewardsSection}>
          <TwaRewardsGrid balance={userBalance} onBalanceChange={() => void fetchBalance()} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.bonusShop.howItWorks}</Text>
          <View style={styles.howItWorksCard}>
            <View style={styles.howItWorksItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.howItWorksText}>{t.bonusShop.step1}</Text>
            </View>
            <View style={styles.howItWorksItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.howItWorksText}>{t.bonusShop.step2}</Text>
            </View>
            <View style={[styles.howItWorksItem, { borderBottomWidth: 0 }]}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.howItWorksText}>{t.bonusShop.step3}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  myBonusesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  myBonusesText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  myBonusesAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
  },
  infoBanner: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  infoBannerGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: '#FCD34D',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeRibbonTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
  },
  ribbonPiece: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#D97706',
  },
  decorativeRibbonBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#F59E0B',
  },
  infoBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoBannerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#F59E0B',
    overflow: 'hidden',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  infoBannerSubtitle: {
    fontSize: 14,
    color: '#B45309',
    fontWeight: '600',
  },
  myPurchasesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  myPurchasesButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
  },
  rewardsSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  howItWorksCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  howItWorksText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
  },
});
