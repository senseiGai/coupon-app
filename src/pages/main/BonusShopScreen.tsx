import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Coins,
  Gift,
  Plane,
  Hotel,
  Coffee,
  ShoppingBag,
  Ticket,
  Star,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/shared/lib/hooks';
import { useNavigation } from '@react-navigation/native';
import { AirplaneBackground } from '@/shared/ui/AirplaneBackground';

// Товары в бонусном магазине
const BONUS_ITEMS = [
  {
    id: '1',
    icon: Plane,
    colors: ['#FCD34D', '#F59E0B'] as const,
    price: 500,
    category: 'travel',
  },
  {
    id: '2',
    icon: Hotel,
    colors: ['#FDE68A', '#FBBF24'] as const,
    price: 1000,
    category: 'travel',
  },
  {
    id: '3',
    icon: Coffee,
    colors: ['#F59E0B', '#D97706'] as const,
    price: 100,
    category: 'food',
  },
  {
    id: '4',
    icon: ShoppingBag,
    colors: ['#FBBF24', '#F59E0B'] as const,
    price: 300,
    category: 'shopping',
  },
  {
    id: '5',
    icon: Ticket,
    colors: ['#FCD34D', '#FBBF24'] as const,
    price: 200,
    category: 'entertainment',
  },
  {
    id: '6',
    icon: Gift,
    colors: ['#F59E0B', '#B45309'] as const,
    price: 750,
    category: 'gifts',
  },
];

export const BonusShopScreen = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const userBalance = 2450; // TODO: получать из API

  const handleRedeem = (item: (typeof BONUS_ITEMS)[0]) => {
    if (userBalance < item.price) {
      Alert.alert(
        t.bonusShop.notEnoughBonuses,
        t.bonusShop.needMore.replace('{amount}', String(item.price - userBalance))
      );
      return;
    }

    Alert.alert(
      t.bonusShop.confirmRedeem,
      t.bonusShop.confirmMessage.replace('{price}', String(item.price)),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.bonusShop.redeem,
          onPress: () => {
            // TODO: API call to redeem bonus
            Alert.alert(t.common.success, t.bonusShop.redeemSuccess);
          },
        },
      ]
    );
  };

  const getItemName = (item: (typeof BONUS_ITEMS)[0]) => {
    const names: Record<string, string> = {
      '1': t.bonusShop.items.tourDiscount,
      '2': t.bonusShop.items.hotelDiscount,
      '3': t.bonusShop.items.coffeeVoucher,
      '4': t.bonusShop.items.shopDiscount,
      '5': t.bonusShop.items.eventTicket,
      '6': t.bonusShop.items.giftBox,
    };
    return names[item.id] || '';
  };

  const getItemDescription = (item: (typeof BONUS_ITEMS)[0]) => {
    const descriptions: Record<string, string> = {
      '1': t.bonusShop.descriptions.tourDiscount,
      '2': t.bonusShop.descriptions.hotelDiscount,
      '3': t.bonusShop.descriptions.coffeeVoucher,
      '4': t.bonusShop.descriptions.shopDiscount,
      '5': t.bonusShop.descriptions.eventTicket,
      '6': t.bonusShop.descriptions.giftBox,
    };
    return descriptions[item.id] || '';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AirplaneBackground />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.bonusShop.title}</Text>
          <View style={styles.balanceChip}>
            <Coins size={16} color="#FFD700" />
            <Text style={styles.balanceText}>{userBalance.toLocaleString()}</Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <LinearGradient
            colors={['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoBannerGradient}>
            {/* Decorative ribbons */}
            <View style={styles.decorativeRibbonTop}>
              <View style={styles.ribbonPiece} />
              <View style={styles.ribbonPiece} />
              <View style={styles.ribbonPiece} />
            </View>
            <View style={styles.infoBannerContent}>
              <View style={styles.infoBannerIcon}>
                <Image
                  source={require('../../../assets/logo.jpg')}
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

        {/* Items Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.bonusShop.availableRewards}</Text>
          <View style={styles.itemsGrid}>
            {BONUS_ITEMS.map((item) => {
              const IconComponent = item.icon;
              const canAfford = userBalance >= item.price;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemCard, !canAfford && styles.itemCardDisabled]}
                  activeOpacity={0.8}
                  onPress={() => handleRedeem(item)}>
                  <LinearGradient
                    colors={canAfford ? [...item.colors] : ['#94A3B8', '#64748B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.itemGradient}>
                    <View style={styles.itemIconContainer}>
                      <IconComponent size={32} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {getItemName(item)}
                    </Text>
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {getItemDescription(item)}
                    </Text>
                    <View style={styles.itemPrice}>
                      <Coins size={14} color="#FFD700" />
                      <Text style={styles.itemPriceText}>{item.price}</Text>
                    </View>
                    {!canAfford && (
                      <View style={styles.lockedOverlay}>
                        <Text style={styles.lockedText}>{t.bonusShop.notEnough}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* How it works */}
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
            <View style={styles.howItWorksItem}>
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
    textShadowColor: 'rgba(217, 119, 6, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoBannerSubtitle: {
    fontSize: 14,
    color: '#B45309',
    fontWeight: '600',
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
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  itemCard: {
    width: '47%',
    marginBottom: 4,
  },
  itemCardDisabled: {
    opacity: 0.8,
  },
  itemGradient: {
    borderRadius: 16,
    padding: 16,
    height: 160,
    justifyContent: 'space-between',
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  itemDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  itemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  itemPriceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
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
