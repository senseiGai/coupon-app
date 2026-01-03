import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Play,
  TrendingUp,
  ShoppingCart,
  ChevronRight,
  Info,
  AlertCircle,
} from 'lucide-react-native';
import { useState } from 'react';
import { BonusService } from '@/entities/bonus/model/bonusService';
import { BonusTransaction, BonusBalance, BonusLimits, BONUS_CONFIG } from '@/shared/types/bonus';
import { useLanguage } from '@/shared/lib/hooks';
import { admobService } from '@/shared/lib/admob';

// Mock данные - в реальном приложении будут из API/State
const mockTransactions: BonusTransaction[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'earned_ad_view',
    amount: 10,
    balanceBefore: 2440,
    balanceAfter: 2450,
    description: 'Награда за просмотр рекламного ролика',
    createdAt: new Date('2025-12-30T14:30:00'),
    expiresAt: new Date('2026-12-30'),
  },
  {
    id: '2',
    userId: 'user1',
    type: 'earned_ad_view',
    amount: 10,
    balanceBefore: 2430,
    balanceAfter: 2440,
    description: 'Награда за просмотр рекламного ролика',
    createdAt: new Date('2025-12-30T12:15:00'),
    expiresAt: new Date('2026-12-30'),
  },
  {
    id: '3',
    userId: 'user1',
    type: 'spent_discount',
    amount: -500,
    balanceBefore: 2930,
    balanceAfter: 2430,
    description: 'Скидка на заказ №12345',
    orderId: '12345',
    createdAt: new Date('2025-12-29T18:00:00'),
  },
  {
    id: '4',
    userId: 'user1',
    type: 'earned_registration',
    amount: 100,
    balanceBefore: 0,
    balanceAfter: 100,
    description: 'Приветственный бонус за регистрацию',
    createdAt: new Date('2025-12-10T10:00:00'),
    expiresAt: new Date('2026-12-10'),
  },
];

export const BalanceScreen = () => {
  const { t } = useLanguage();
  const [showRules, setShowRules] = useState(false);

  // Mock состояние - в реальном приложении из контекста/store
  const balance: BonusBalance = {
    userId: 'user1',
    total: 2450,
    available: 2450,
    pending: 0,
    lastUpdated: new Date(),
  };

  const limits: BonusLimits = {
    maxAdViewsPerDay: BONUS_CONFIG.LIMITS.MAX_AD_VIEWS_PER_DAY,
    currentAdViewsToday: 3,
    lastAdViewDate: new Date().toISOString().split('T')[0],
    maxDiscountPercent: BONUS_CONFIG.LIMITS.MAX_DISCOUNT_PERCENT,
    bonusExpirationDays: BONUS_CONFIG.LIMITS.BONUS_EXPIRATION_DAYS,
  };

  const handleWatchAd = async () => {
    const canWatch = BonusService.canWatchAd(limits);

    if (!canWatch.allowed) {
      Alert.alert(t.main.balance.limitReached, canWatch.reason || t.main.balance.tryTomorrow);
      return;
    }

    // Проверяем, готова ли реклама
    if (!admobService.isAdReady()) {
      Alert.alert(
        t.main.balance.watchAdTitle,
        'Реклама загружается... Попробуйте через несколько секунд.',
        [{ text: 'OK' }]
      );
      // Предзагружаем рекламу
      admobService.preloadAd();
      return;
    }

    // Показываем подтверждение
    const description = t.main.balance.watchAdDescription.replace(
      '{amount}',
      String(BONUS_CONFIG.REWARDS.AD_VIEW)
    );
    Alert.alert(t.main.balance.watchAdTitle, description, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.main.balance.watchAdButton,
        onPress: async () => {
          try {
            const result = await admobService.showRewardedAd();

            if (result.success) {
              // Здесь должна быть логика начисления бонусов через API
              Alert.alert(
                t.common.success,
                `Вы получили ${BONUS_CONFIG.REWARDS.AD_VIEW} бонусов!`,
                [{ text: 'OK' }]
              );
              console.log('[BalanceScreen] Ad watched successfully, reward earned');
            } else {
              Alert.alert(
                t.common.error,
                result.error || 'Не удалось показать рекламу. Попробуйте позже.',
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            console.error('[BalanceScreen] Error showing ad:', error);
            Alert.alert(t.common.error, 'Произошла ошибка при показе рекламы.', [{ text: 'OK' }]);
          }
        },
      },
    ]);
  };

  const handleShowRules = () => {
    setShowRules(!showRules);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.main.balance.bonusesTitle}</Text>
          <TouchableOpacity onPress={handleShowRules} style={styles.infoButton}>
            <Info size={24} color="#0EA5E9" />
          </TouchableOpacity>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <AlertCircle size={20} color="#0EA5E9" />
          <Text style={styles.noticeText}>{t.main.balance.noticeText}</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t.main.balance.availableBonuses}</Text>
          <Text style={styles.balanceAmount}>{BonusService.formatBonus(balance.available)}</Text>
          <Text style={styles.balanceEquivalent}>
            = {balance.available.toLocaleString('ru-RU')} {t.main.balance.bonusEquivalent}
          </Text>
          <View style={styles.balanceHint}>
            <Text style={styles.balanceHintText}>{t.main.balance.bonusHint}</Text>
          </View>
        </View>

        {/* Watch Ad Button */}
        <View style={styles.adSection}>
          <TouchableOpacity
            style={[
              styles.watchAdButton,
              limits.currentAdViewsToday >= limits.maxAdViewsPerDay && styles.watchAdButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleWatchAd}
            disabled={limits.currentAdViewsToday >= limits.maxAdViewsPerDay}>
            <View style={styles.watchAdIconContainer}>
              <Play size={24} color="#0EA5E9" strokeWidth={2} fill="#0EA5E9" />
            </View>
            <View style={styles.watchAdContent}>
              <Text style={styles.watchAdTitle}>{t.main.balance.watchAdTitle}</Text>
              <Text style={styles.watchAdSubtitle}>
                +{BONUS_CONFIG.REWARDS.AD_VIEW} {t.main.home.bonuses.toLowerCase()}
              </Text>
            </View>
            <View style={styles.watchAdArrow}>
              <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          <View style={styles.adLimitInfo}>
            <Text style={styles.adLimitText}>
              {t.main.balance.today}: {limits.currentAdViewsToday}/{limits.maxAdViewsPerDay}{' '}
              {t.main.balance.views}
            </Text>
            <View style={styles.adLimitBar}>
              <View
                style={[
                  styles.adLimitFill,
                  { width: `${(limits.currentAdViewsToday / limits.maxAdViewsPerDay) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Bonus Rules (collapsible) */}
        {showRules && (
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>{t.bonusRules.title}</Text>
            <Text style={styles.rulesDescription}>{t.bonusRules.description}</Text>

            {t.bonusRules.sections.map((section, index) => (
              <View key={index} style={styles.ruleSection}>
                <Text style={styles.ruleSectionTitle}>{section.title}</Text>
                {section.items.map((item, itemIndex) => {
                  // Заменяем плейсхолдеры на реальные значения
                  let itemText = item;
                  if (index === 1) {
                    // "Как получить бонусы" - добавляем количество бонусов
                    const rewards = [
                      BONUS_CONFIG.REWARDS.REGISTRATION,
                      BONUS_CONFIG.REWARDS.PROFILE_COMPLETE,
                      BONUS_CONFIG.REWARDS.AD_VIEW,
                      BONUS_CONFIG.REWARDS.REFERRAL,
                    ];
                    itemText = `${rewards[itemIndex]} ${item}`;
                    itemText = itemText.replace(
                      '{maxAds}',
                      String(BONUS_CONFIG.LIMITS.MAX_AD_VIEWS_PER_DAY)
                    );
                  } else if (index === 2) {
                    // "Как использовать бонусы"
                    itemText = itemText
                      .replace('{maxDiscount}', String(BONUS_CONFIG.LIMITS.MAX_DISCOUNT_PERCENT))
                      .replace('{minOrder}', String(BONUS_CONFIG.MIN_ORDER_AMOUNT_FOR_BONUS));
                  } else if (index === 3) {
                    // "Ограничения"
                    itemText = itemText
                      .replace('{maxAds}', String(BONUS_CONFIG.LIMITS.MAX_AD_VIEWS_PER_DAY))
                      .replace(
                        '{expirationDays}',
                        String(BONUS_CONFIG.LIMITS.BONUS_EXPIRATION_DAYS)
                      );
                  }

                  return (
                    <View key={itemIndex} style={styles.ruleItem}>
                      <Text style={styles.ruleBullet}>•</Text>
                      <Text style={styles.ruleText}>{itemText}</Text>
                    </View>
                  );
                })}
              </View>
            ))}

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>{t.bonusRules.disclaimer}</Text>
            </View>
          </View>
        )}

        {/* How to Earn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.main.balance.howToEarn}</Text>
          <View style={styles.earnCard}>
            <View style={styles.earnItem}>
              <Text style={styles.earnEmoji}>🎉</Text>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>{t.main.balance.registration}</Text>
                <Text style={styles.earnAmount}>
                  +{BONUS_CONFIG.REWARDS.REGISTRATION} {t.main.home.bonuses.toLowerCase()}
                </Text>
              </View>
            </View>
            <View style={styles.earnItem}>
              <Text style={styles.earnEmoji}>✅</Text>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>{t.main.balance.completeProfile}</Text>
                <Text style={styles.earnAmount}>
                  +{BONUS_CONFIG.REWARDS.PROFILE_COMPLETE} {t.main.home.bonuses.toLowerCase()}
                </Text>
              </View>
            </View>
            <View style={styles.earnItem}>
              <Text style={styles.earnEmoji}>📺</Text>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>{t.main.balance.watchAd}</Text>
                <Text style={styles.earnAmount}>
                  +{BONUS_CONFIG.REWARDS.AD_VIEW} {t.main.home.bonuses.toLowerCase()} (
                  {t.main.tours.from} {BONUS_CONFIG.LIMITS.MAX_AD_VIEWS_PER_DAY}/
                  {t.main.balance.perDay})
                </Text>
              </View>
            </View>
            <View style={styles.earnItem}>
              <Text style={styles.earnEmoji}>👥</Text>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>{t.main.balance.inviteFriend}</Text>
                <Text style={styles.earnAmount}>
                  +{BONUS_CONFIG.REWARDS.REFERRAL} {t.main.home.bonuses.toLowerCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.main.balance.history}</Text>
          </View>

          {mockTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.historyItem}>
              <View
                style={[
                  styles.historyIcon,
                  { backgroundColor: transaction.amount > 0 ? '#DCFCE7' : '#FEE2E2' },
                ]}>
                {transaction.amount > 0 ? (
                  <TrendingUp size={20} color="#16A34A" strokeWidth={2} />
                ) : (
                  <ShoppingCart size={20} color="#DC2626" strokeWidth={2} />
                )}
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>
                  {BonusService.getTransactionTitle(transaction.type)}
                </Text>
                <Text style={styles.historyDescription}>{transaction.description}</Text>
                <Text style={styles.historyDate}>
                  {new Date(transaction.createdAt).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text
                style={[
                  styles.historyAmount,
                  { color: transaction.amount > 0 ? '#16A34A' : '#DC2626' },
                ]}>
                {transaction.amount > 0 ? '+' : ''}
                {Math.abs(transaction.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer spacing */}
        <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  infoButton: {
    padding: 8,
  },
  noticeCard: {
    marginHorizontal: 20,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#0369A1',
    lineHeight: 18,
    fontWeight: '500',
  },
  balanceCard: {
    marginHorizontal: 20,
    backgroundColor: '#0EA5E9',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceEquivalent: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  balanceHint: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  balanceHintText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  adSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  watchAdButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  watchAdButtonDisabled: {
    opacity: 0.5,
  },
  watchAdIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  watchAdContent: {
    flex: 1,
  },
  watchAdTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  watchAdSubtitle: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  watchAdArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adLimitInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
  },
  adLimitText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  adLimitBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  adLimitFill: {
    height: 4,
    backgroundColor: '#0EA5E9',
    borderRadius: 2,
  },
  // Rules section
  rulesCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  rulesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  rulesDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  ruleSection: {
    marginBottom: 20,
  },
  ruleSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  ruleBullet: {
    fontSize: 14,
    color: '#0EA5E9',
    marginRight: 8,
    fontWeight: '700',
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 18,
  },
  // Earn section
  earnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  earnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  earnEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  earnInfo: {
    flex: 1,
  },
  earnTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  earnAmount: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  historyDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
