import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Gift,
  Plane,
  Coffee,
  ShoppingBag,
  Ticket,
  Star,
  MapPin,
  Clock,
  ShoppingCart,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage, useBonus } from '@/shared/lib/hooks';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/navigation/MainStack';
import { AirplaneBackground } from '@/shared/ui/AirplaneBackground';
import { BonusShopItem, BonusShopItemType } from '@/shared/types/bonus';
import { TwaRewardsGrid } from '@/features/twa-rewards/ui/TwaRewardsGrid';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 16px padding * 2 + 16px gap

// Иконки для типов товаров
const TYPE_ICONS: Record<BonusShopItemType, typeof Plane> = {
  TOUR_DISCOUNT: Plane,
  DISCOUNT_COUPON: Ticket,
  GIFT: Gift,
  SERVICE: Coffee,
  OTHER: ShoppingBag,
};

// Цвета для типов товаров
const TYPE_COLORS: Record<BonusShopItemType, readonly [string, string]> = {
  TOUR_DISCOUNT: ['#FCD34D', '#F59E0B'] as const,
  DISCOUNT_COUPON: ['#FDE68A', '#FBBF24'] as const,
  GIFT: ['#F59E0B', '#B45309'] as const,
  SERVICE: ['#F59E0B', '#D97706'] as const,
  OTHER: ['#FBBF24', '#F59E0B'] as const,
};

type Language = 'ru' | 'en' | 'uk';

// Парсинг локализованного текста из JSON строки
const getLocalizedText = (jsonString: string, lang: Language): string => {
  try {
    const obj = JSON.parse(jsonString);
    return obj[lang] || obj.en || obj.ru || jsonString;
  } catch {
    return jsonString;
  }
};

// Форматирование цены
const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return price.toLocaleString('ru-RU');
  }
  return price.toString();
};

export const BonusShopScreen = () => {
  const { t, currentLang } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    balance,
    loading,
    shopItems,
    fetchShopItems,
    fetchBalance,
    purchaseShopItem,
  } = useBonus();
  const userBalance = balance?.available || 0;

  // Обновлять данные при фокусе на экран
  useFocusEffect(
    useCallback(() => {
      fetchBalance();
      fetchShopItems();
    }, [fetchBalance, fetchShopItems])
  );

  const handlePurchase = async (item: BonusShopItem) => {
    if (userBalance < item.price) {
      Alert.alert(
        t.bonusShop.notEnoughBonuses,
        t.bonusShop.needMore.replace('{amount}', String(item.price - userBalance))
      );
      return;
    }

    if (item.stock !== null && item.stock !== undefined && item.stock <= 0) {
      Alert.alert(t.common.error, t.bonusShop.outOfStock || 'Out of stock');
      return;
    }

    Alert.alert(
      t.bonusShop.confirmRedeem,
      t.bonusShop.confirmMessage.replace('{price}', String(item.price)),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.bonusShop.redeem,
          onPress: async () => {
            const result = await purchaseShopItem(item.id);
            if (result.success) {
              const code = result.data?.code || '';
              Alert.alert(
                t.common.success,
                `${t.bonusShop.redeemSuccess}\n\n${t.bonusShop.purchaseCode || 'Code'}: ${code}`
              );
              fetchBalance();
              fetchShopItems();
            } else {
              Alert.alert(t.common.error, result.error || 'Failed to purchase');
            }
          },
        },
      ]
    );
  };

  const getItemIcon = (item: BonusShopItem) => {
    return TYPE_ICONS[item.type] || ShoppingBag;
  };

  const getItemColors = (item: BonusShopItem): readonly [string, string] => {
    return TYPE_COLORS[item.type] || TYPE_COLORS.OTHER;
  };

  if (loading && shopItems.length === 0) {
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.bonusShop.title}</Text>
          <View style={styles.balanceChip}>
            <Plane size={16} color="#FFD700" />
            <Text style={styles.balanceText}>{formatPrice(userBalance)}</Text>
          </View>
        </View>

        {/* Info Banner */}
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

        {/* My Purchases Button */}
        <TouchableOpacity
          style={styles.myPurchasesButton}
          onPress={() => navigation.navigate('MyPurchases')}>
          <ShoppingCart size={20} color="#0EA5E9" />
          <Text style={styles.myPurchasesButtonText}>{t.bonusShop.myPurchases}</Text>
          <ArrowLeft size={16} color="#64748B" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        {/* TWA rewards catalog */}
        <View style={styles.twaRewardsSection}>
          <TwaRewardsGrid balance={userBalance} />
        </View>

        {/* Legacy API shop items (if any) */}
        {shopItems.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.bonusShop.otherOffers || t.bonusShop.availableRewards}</Text>
          <View style={styles.itemsGrid}>
            {shopItems.map((item) => {
              const IconComponent = getItemIcon(item);
              const canAfford = userBalance >= item.price;
              const isOutOfStock = item.stock !== null && item.stock !== undefined && item.stock <= 0;
              const itemName = getLocalizedText(item.name, currentLang as Language);
              const itemDescription = getLocalizedText(item.description, currentLang as Language);
              const isDisabled = !canAfford || isOutOfStock;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  activeOpacity={0.8}
                  onPress={() => handlePurchase(item)}>
                  <LinearGradient
                    colors={!isDisabled ? [...getItemColors(item)] : ['#94A3B8', '#64748B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.itemGradient}>

                    {/* Top Row: Badges */}
                    <View style={styles.topBadgesRow}>
                      {item.originalValue ? (
                        <View style={styles.worthBadge}>
                          <Text style={styles.worthBadgeText}>
                            {formatPrice(item.originalValue)}
                          </Text>
                        </View>
                      ) : (
                        <View />
                      )}
                      {isOutOfStock ? (
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusBadgeText}>
                            {t.bonusShop.outOfStock || 'Out of stock'}
                          </Text>
                        </View>
                      ) : !canAfford ? (
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusBadgeText}>{t.bonusShop.notEnough}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Icon */}
                    <View style={styles.itemIconContainer}>
                      <IconComponent size={28} color="#FFFFFF" strokeWidth={2} />
                    </View>

                    {/* Content */}
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {itemName}
                      </Text>
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {itemDescription}
                      </Text>

                      {/* Meta info */}
                      {(item.location || item.duration) && (
                        <View style={styles.metaContainer}>
                          {item.location && (
                            <View style={styles.metaRow}>
                              <MapPin size={11} color="rgba(255,255,255,0.85)" />
                              <Text style={styles.metaText} numberOfLines={1}>
                                {item.location}
                              </Text>
                            </View>
                          )}
                          {item.duration && (
                            <View style={styles.metaRow}>
                              <Clock size={11} color="rgba(255,255,255,0.85)" />
                              <Text style={styles.metaText}>{item.duration}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Price */}
                    <View style={styles.priceContainer}>
                      <Plane size={14} color="#FFD700" />
                      <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
        ) : null}

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
  twaRewardsSection: {
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
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  itemCard: {
    width: CARD_WIDTH,
  },
  itemGradient: {
    borderRadius: 16,
    padding: 12,
    minHeight: 240,
  },
  topBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    minHeight: 22,
  },
  worthBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  worthBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 14,
    marginBottom: 6,
  },
  metaContainer: {
    marginTop: 4,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
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
