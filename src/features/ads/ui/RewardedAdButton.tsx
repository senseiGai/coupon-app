import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Play, Clock } from 'lucide-react-native';
import { showRewardedAd } from '@/shared/lib/admob';
import { useBonus } from '@/shared/lib/hooks/useBonus';
import { useLanguage } from '@/shared/lib/hooks';
import { BONUS_CONFIG } from '@/shared/types/bonus';
import {
  formatTwaAmount,
  formatRewardPerViewLabel,
  formatCooldownCountdown,
  resolveBatchCooldownUntil,
  REWARD_PER_AD_VIEW,
  ADS_PER_BATCH,
  BATCHES_PER_DAY,
  MAX_AD_VIEWS_PER_DAY,
} from '@/shared/constants/adRewards';
import { useProfile } from '@/shared/lib/hooks';
import type { CanWatchAdResponse } from '@/shared/types/bonus';
import { wp, hp, fontSize, responsive } from '@/shared/lib/responsive';

interface RewardedAdButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function isAlreadyRewardedMessage(msg: string | undefined): boolean {
  if (!msg) {
    return false;
  }
  const m = msg.toLowerCase();
  return m.includes('already rewarded') || m.includes('уже') || m.includes('вже');
}

function normalizeRewardAmount(amount: number | undefined): number {
  if (amount === undefined || !Number.isFinite(amount) || amount > 0.1) {
    return REWARD_PER_AD_VIEW;
  }
  return amount;
}

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({ onSuccess, onError }) => {
  const { t } = useLanguage();
  const { limits, checkCanWatchAd, requestAdView, claimAdReward, fetchBalance, fetchLimits } =
    useBonus();
  const { data: profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<CanWatchAdResponse | null>(null);
  const [, setTick] = useState(0);

  const adsPerBatch = ADS_PER_BATCH;
  const batchesPerDay = BATCHES_PER_DAY;
  const maxViews = MAX_AD_VIEWS_PER_DAY;
  const currentViews = quota?.currentAdViewsToday ?? limits?.currentAdViewsToday ?? 0;
  const cooldownUntilIso = resolveBatchCooldownUntil(
    quota?.batchCooldownUntil ?? limits?.batchCooldownUntil,
    currentViews,
    limits?.lastBatchCompletedAt,
    adsPerBatch,
  );
  const countdown = formatCooldownCountdown(cooldownUntilIso);
  const inCooldown = !!countdown;

  const refreshQuota = useCallback(async () => {
    const result = await checkCanWatchAd();
    setQuota(result);
  }, [checkCanWatchAd]);

  useEffect(() => {
    void refreshQuota();
    const poll = setInterval(() => void refreshQuota(), 15000);
    return () => clearInterval(poll);
  }, [refreshQuota, limits?.currentAdViewsToday, limits?.batchCooldownUntil]);

  useEffect(() => {
    if (!cooldownUntilIso) {
      return;
    }
    const id = setInterval(() => {
      setTick((n) => n + 1);
      if (!formatCooldownCountdown(cooldownUntilIso)) {
        void refreshQuota();
        void fetchLimits();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownUntilIso, refreshQuota, fetchLimits]);

  const rewardPerView = normalizeRewardAmount(
    limits?.rewardPerView ?? quota?.rewardPerView ?? BONUS_CONFIG.REWARDS.AD_VIEW,
  );
  const batchLeft =
    currentViews > 0 && currentViews % adsPerBatch === 0
      ? adsPerBatch
      : adsPerBatch - (currentViews % adsPerBatch);
  const batchNum = Math.min(
    batchesPerDay,
    currentViews > 0 && currentViews % adsPerBatch === 0
      ? Math.floor(currentViews / adsPerBatch)
      : Math.floor(currentViews / adsPerBatch) + 1,
  );
  const atDailyLimit = currentViews >= maxViews;
  const isDisabled = loading || inCooldown || atDailyLimit || (quota !== null && !quota.allowed && !inCooldown);

  const handleWatchAd = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(t.common.error, t.main.balance.adError);
      return;
    }

    const canWatch = await checkCanWatchAd();
    setQuota(canWatch);
    if (!canWatch.allowed) {
      Alert.alert(
        t.main.balance.limitReached,
        canWatch.reason || t.main.balance.limitReachedMessage,
      );
      onError?.(canWatch.reason || 'Limit reached');
      return;
    }

    setLoading(true);
    try {
      const adReq = await requestAdView('admob');
      if (!adReq?.customData) {
        Alert.alert(t.common.error, t.main.balance.bonusError);
        onError?.('No ad request');
        return;
      }

      const adResult = await showRewardedAd(
        adReq.customData,
        profile?.id ? String(profile.id) : undefined,
      );
      if (!adResult.success) {
        Alert.alert(t.common.error, adResult.error || t.main.balance.adError);
        onError?.(adResult.error || 'Ad failed');
        return;
      }

      if (!adResult.earned) {
        return;
      }

      const claim = await claimAdReward(adReq.adViewId);
      if (claim.success || isAlreadyRewardedMessage(claim.error)) {
        await fetchBalance();
        await fetchLimits();
        await refreshQuota();
        const credited = normalizeRewardAmount(claim.rewardAmount);
        const displayAmount = formatTwaAmount(credited);
        Alert.alert(
          t.common.success,
          t.main.balance.bonusReceived.replace('{amount}', displayAmount),
          [{ text: t.main.balance.great }],
        );
        onSuccess?.();
        return;
      }

      Alert.alert(t.common.error, claim.error || t.main.balance.bonusError);
      onError?.(claim.error || 'Claim failed');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t.main.balance.generalError;
      Alert.alert(t.common.error, message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = responsive({ xs: 20, sm: 22, default: 24 });

  let subtitle = t.main.balance.watchAdDescription.replace('{amount}', formatRewardPerViewLabel());
  subtitle += `\n${t.main.balance.dailyQuota
    .replace('{current}', String(currentViews))
    .replace('{max}', String(maxViews))
    .replace('{perBatch}', String(adsPerBatch))
    .replace('{batches}', String(batchesPerDay))}`;
  subtitle += `\n${t.main.balance.batchProgress
    .replace('{batch}', String(batchNum))
    .replace('{totalBatches}', String(batchesPerDay))
    .replace('{left}', String(batchLeft))}`;

  const buttonTitle = loading
    ? t.common.loading
    : inCooldown && countdown
      ? t.main.balance.nextAdCooldown.replace('{time}', countdown)
      : atDailyLimit
        ? t.main.balance.maxAdsReached
        : t.main.balance.watchAdBtn;

  return (
    <View>
      {inCooldown && countdown ? (
        <View style={styles.cooldownBanner}>
          <Clock size={22} color="#92400E" />
          <View style={styles.cooldownTextWrap}>
            <Text style={styles.cooldownTitle}>{t.main.balance.cooldownTitle}</Text>
            <Text style={styles.cooldownTimer}>
              {t.main.balance.nextAdCooldown.replace('{time}', countdown)}
            </Text>
          </View>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={handleWatchAd}
        disabled={isDisabled}
        activeOpacity={0.8}>
        <View style={styles.iconContainer}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Play size={iconSize} color="#fff" fill="#fff" />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.buttonText} numberOfLines={2}>
            {buttonTitle}
          </Text>
          <Text style={styles.buttonSubtext} numberOfLines={6}>
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cooldownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: wp(12),
    padding: wp(14),
    marginBottom: hp(12),
  },
  cooldownTextWrap: {
    flex: 1,
  },
  cooldownTitle: {
    fontSize: fontSize(14),
    fontWeight: '700',
    color: '#92400E',
    marginBottom: hp(4),
  },
  cooldownTimer: {
    fontSize: fontSize(18),
    fontWeight: '800',
    color: '#B45309',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: wp(16),
    padding: wp(16),
    gap: wp(12),
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  iconContainer: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: '#fff',
    marginBottom: hp(4),
  },
  buttonSubtext: {
    fontSize: fontSize(13),
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: fontSize(18),
  },
});
