import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info, AlertCircle } from 'lucide-react-native';
import { useState } from 'react';
import { BonusService } from '@/entities/bonus/model/bonusService';
import { BONUS_CONFIG } from '@/shared/types/bonus';
import { useLanguage } from '@/shared/lib/hooks';
import { useBonus } from '@/shared/lib/hooks/useBonus';
import { AirplaneBackground } from '@/shared/ui/AirplaneBackground';
import { wp, hp, fontSize, responsive } from '@/shared/lib/responsive';
import { RewardedAdButton } from '@/features/ads/ui/RewardedAdButton';
import {
  formatTwaAmount,
  getProgressTowardOneTwa,
  REWARD_PER_AD_VIEW,
  VIEWS_PER_TWA,
  ADS_PER_BATCH,
  BATCHES_PER_DAY,
} from '@/shared/constants/adRewards';

export const BalanceScreen = () => {
  const { t } = useLanguage();
  const [showRules, setShowRules] = useState(false);
  const { balance, limits, loading, fetchBalance, fetchLimits } = useBonus();

  const handleShowRules = () => {
    setShowRules(!showRules);
  };

  const rewardPerView = limits?.rewardPerView ?? BONUS_CONFIG.REWARDS.AD_VIEW ?? REWARD_PER_AD_VIEW;
  const twaProgress =
    limits?.progressToOneTwa !== undefined && limits?.viewsTowardOneTwa !== undefined
      ? {
          progress: limits.progressToOneTwa,
          viewsTowardOneTwa: limits.viewsTowardOneTwa,
          viewsPerTwa: limits.viewsPerTwa ?? VIEWS_PER_TWA,
        }
      : getProgressTowardOneTwa(balance?.available ?? 0);
  const progressPercent = Math.min(100, Math.round(twaProgress.progress * 100));
  const currentViews = limits?.currentAdViewsToday ?? 0;
  const maxViews = limits?.maxAdViewsPerDay ?? BONUS_CONFIG.LIMITS.MAX_AD_VIEWS_PER_DAY;

  if (loading && !balance) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={styles.loadingText}>{t.common.loading}</Text>
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
          <Text style={styles.headerTitle}>{t.main.balance.bonusesTitle}</Text>
          <TouchableOpacity onPress={handleShowRules} style={styles.infoButton}>
            <Info size={wp(24)} color="#0EA5E9" />
          </TouchableOpacity>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <AlertCircle size={wp(20)} color="#0EA5E9" />
          <Text style={styles.noticeText}>{t.main.balance.noticeText}</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t.main.balance.twaBalanceLabel}</Text>
          <Text style={styles.balanceAmount}>{formatTwaAmount(balance?.available || 0)}</Text>
          <Text style={styles.balanceEquivalent}>
            = {(balance?.available || 0).toLocaleString('ru-RU')} {t.main.balance.bonusEquivalent}
          </Text>
          <View style={styles.balanceHint}>
            <Text style={styles.balanceHintText}>{t.main.balance.bonusHint}</Text>
          </View>
        </View>

        {/* Progress toward 1 TWA */}
        <View style={styles.adSection}>
          <View style={styles.twaProgressCard}>
            <Text style={styles.twaProgressTitle}>{t.main.balance.twaProgressTitle}</Text>
            <Text style={styles.twaProgressHint}>
              {t.main.balance.twaProgressHint
                .replace('{current}', String(twaProgress.viewsTowardOneTwa))
                .replace('{total}', String(twaProgress.viewsPerTwa))
                .replace('{reward}', formatTwaAmount(rewardPerView))}
            </Text>
            <View style={styles.twaProgressBar}>
              <View style={[styles.twaProgressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.twaProgressPercent}>{progressPercent}% → 1 TWA</Text>
          </View>

          <View style={styles.adLimitInfo}>
            <Text style={styles.adLimitText}>
              {t.main.balance.dailyQuota
                .replace('{current}', String(currentViews))
                .replace('{max}', String(maxViews))}
            </Text>
            <Text style={styles.adLimitSubtext}>
              {ADS_PER_BATCH} × {BATCHES_PER_DAY} · {t.main.balance.periodResetsAt}
            </Text>
            <View style={styles.adLimitBar}>
              <View
                style={[
                  styles.adLimitFill,
                  {
                    width: `${maxViews ? (currentViews / maxViews) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
          </View>
          <View style={{ marginTop: hp(14) }}>
            <RewardedAdButton
              onSuccess={() => {
                void fetchBalance();
                void fetchLimits();
              }}
            />
          </View>
        </View>

        {/* Bonus Rules (collapsible) */}
        {showRules && (
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>{t.bonusRules.title}</Text>
            <Text style={styles.rulesDescription}>{t.bonusRules.description}</Text>

            {t.bonusRules.sections.map(
              (section: { title: string; items: string[] }, index: number) => (
                <View key={index} style={styles.ruleSection}>
                  <Text style={styles.ruleSectionTitle}>{section.title}</Text>
                  {section.items.map((item: string, itemIndex: number) => {
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
              )
            )}

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>{t.bonusRules.disclaimer}</Text>
            </View>
          </View>
        )}

        {/* Footer spacing */}
        <View style={{ height: hp(40) }} />
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
    paddingHorizontal: wp(20),
    paddingTop: hp(16),
    paddingBottom: hp(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize(28),
    fontWeight: '700',
    color: '#0F172A',
  },
  infoButton: {
    padding: wp(8),
  },
  noticeCard: {
    marginHorizontal: wp(20),
    backgroundColor: '#E0F2FE',
    borderRadius: wp(12),
    padding: wp(16),
    marginBottom: hp(16),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(12),
  },
  noticeText: {
    flex: 1,
    fontSize: fontSize(13),
    color: '#0369A1',
    lineHeight: fontSize(18),
    fontWeight: '500',
  },
  balanceCard: {
    marginHorizontal: wp(20),
    backgroundColor: '#0EA5E9',
    borderRadius: wp(20),
    padding: wp(24),
    marginBottom: hp(20),
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: fontSize(14),
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: hp(8),
  },
  balanceAmount: {
    fontSize: responsive({ xs: fontSize(36), sm: fontSize(38), default: fontSize(42) }),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: hp(8),
  },
  balanceEquivalent: {
    fontSize: fontSize(16),
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: hp(16),
  },
  balanceHint: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: wp(16),
    paddingVertical: hp(10),
    borderRadius: wp(12),
  },
  balanceHintText: {
    fontSize: fontSize(13),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  adSection: {
    paddingHorizontal: wp(20),
    marginBottom: hp(20),
  },
  watchAdButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(16),
    padding: wp(20),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(12),
  },
  watchAdButtonDisabled: {
    opacity: 0.5,
  },
  watchAdIconContainer: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(12),
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(16),
  },
  watchAdContent: {
    flex: 1,
  },
  watchAdTitle: {
    fontSize: fontSize(17),
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: hp(4),
  },
  watchAdSubtitle: {
    fontSize: fontSize(14),
    color: '#10B981',
    fontWeight: '500',
  },
  watchAdArrow: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adLimitInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(12),
    padding: wp(14),
  },
  adLimitText: {
    fontSize: fontSize(13),
    color: '#64748B',
    marginBottom: hp(8),
  },
  adLimitBar: {
    height: hp(4),
    backgroundColor: '#E2E8F0',
    borderRadius: wp(2),
  },
  adLimitFill: {
    height: hp(4),
    backgroundColor: '#94A3B8',
    borderRadius: wp(2),
  },
  twaProgressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(12),
    padding: wp(14),
    marginBottom: hp(12),
  },
  twaProgressTitle: {
    fontSize: fontSize(15),
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: hp(6),
  },
  twaProgressHint: {
    fontSize: fontSize(13),
    color: '#64748B',
    marginBottom: hp(10),
    lineHeight: fontSize(18),
  },
  twaProgressBar: {
    height: hp(10),
    backgroundColor: '#DCFCE7',
    borderRadius: wp(6),
    overflow: 'hidden',
  },
  twaProgressFill: {
    height: hp(10),
    backgroundColor: '#22C55E',
    borderRadius: wp(6),
  },
  twaProgressPercent: {
    marginTop: hp(8),
    fontSize: fontSize(12),
    fontWeight: '600',
    color: '#15803D',
  },
  adLimitSubtext: {
    fontSize: fontSize(12),
    color: '#94A3B8',
    marginBottom: hp(8),
  },
  // Rules section
  rulesCard: {
    marginHorizontal: wp(20),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(16),
    padding: wp(20),
    marginBottom: hp(20),
  },
  rulesTitle: {
    fontSize: fontSize(20),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: hp(8),
  },
  rulesDescription: {
    fontSize: fontSize(14),
    color: '#64748B',
    marginBottom: hp(20),
    lineHeight: fontSize(20),
  },
  ruleSection: {
    marginBottom: hp(20),
  },
  ruleSectionTitle: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: hp(10),
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: hp(6),
    paddingLeft: wp(8),
  },
  ruleBullet: {
    fontSize: fontSize(14),
    color: '#0EA5E9',
    marginRight: wp(8),
    fontWeight: '700',
  },
  ruleText: {
    flex: 1,
    fontSize: fontSize(14),
    color: '#475569',
    lineHeight: fontSize(20),
  },
  disclaimer: {
    backgroundColor: '#FFF7ED',
    borderRadius: wp(12),
    padding: wp(14),
    marginTop: hp(10),
  },
  disclaimerText: {
    fontSize: fontSize(12),
    color: '#9A3412',
    lineHeight: fontSize(18),
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(16),
    fontSize: fontSize(16),
    color: '#64748B',
  },
});
