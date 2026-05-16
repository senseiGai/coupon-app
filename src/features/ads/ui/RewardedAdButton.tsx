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
import { Play } from 'lucide-react-native';
import { showRewardedAd } from '@/shared/lib/admob';
import { useBonus } from '@/shared/lib/hooks/useBonus';
import { useLanguage } from '@/shared/lib/hooks';
import { BONUS_CONFIG } from '@/shared/types/bonus';
import {
  formatTwaAmount,
  REWARD_PER_AD_VIEW,
  ADS_PER_BATCH,
  BATCHES_PER_DAY,
} from '@/shared/constants/adRewards';
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

function formatRewardAmount(amount: number): string {
  return formatTwaAmount(amount);
}

function getCooldownMinutes(untilIso: string | null | undefined): number | null {
  if (!untilIso) {
    return null;
  }
  const ms = new Date(untilIso).getTime() - Date.now();
  if (ms <= 0) {
    return null;
  }
  return Math.max(1, Math.ceil(ms / 60000));
}

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({ onSuccess, onError }) => {
  const { t } = useLanguage();
  const { limits, checkCanWatchAd, requestAdView, claimAdReward, fetchBalance, fetchLimits } =
    useBonus();
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<CanWatchAdResponse | null>(null);

  const refreshQuota = useCallback(async () => {
    const result = await checkCanWatchAd();
    setQuota(result);
  }, [checkCanWatchAd]);

  useEffect(() => {
    void refreshQuota();
  }, [refreshQuota, limits?.currentAdViewsToday, limits?.batchCooldownUntil]);

  const rewardPerView =
    limits?.rewardPerView ?? quota?.rewardPerView ?? BONUS_CONFIG.REWARDS.AD_VIEW ?? REWARD_PER_AD_VIEW;
  const cooldownMinutes = getCooldownMinutes(quota?.batchCooldownUntil ?? limits?.batchCooldownUntil);
  const atDailyLimit = quota ? !quota.allowed && !cooldownMinutes : false;
  const inCooldown = !!cooldownMinutes;
  const isDisabled = loading || inCooldown || (quota !== null && !quota.allowed);

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
        canWatch.reason || t.main.balance.limitReachedMessage
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

      const adResult = await showRewardedAd(adReq.customData);
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
        const amount = formatRewardAmount(claim.rewardAmount ?? rewardPerView);
        Alert.alert(
          t.common.success,
          t.main.balance.bonusReceived.replace('{amount}', amount),
          [{ text: t.main.balance.great }]
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
  const batchLeft = quota?.batchRemaining ?? limits?.batchRemaining ?? ADS_PER_BATCH;
  const currentViews = quota?.currentAdViewsToday ?? limits?.currentAdViewsToday ?? 0;
  const maxViews = quota?.maxAdViewsPerDay ?? limits?.maxAdViewsPerDay ?? BONUS_CONFIG.LIMITS.MAX_AD_VIEWS_PER_DAY;

  let subtitle = t.main.balance.watchAdDescription.replace(
    '{amount}',
    formatRewardAmount(rewardPerView)
  );
  subtitle += `\n${t.main.balance.dailyQuota
    .replace('{current}', String(currentViews))
    .replace('{max}', String(maxViews))}`;
  if (inCooldown && cooldownMinutes) {
    subtitle += `\n${t.main.balance.batchCooldown.replace('{minutes}', String(cooldownMinutes))}`;
  } else if (batchLeft > 0 && batchLeft < ADS_PER_BATCH) {
    const batchNum = Math.min(BATCHES_PER_DAY, Math.floor(currentViews / ADS_PER_BATCH) + 1);
    subtitle += `\n${t.main.balance.batchProgress
      .replace('{batch}', String(batchNum))
      .replace('{totalBatches}', String(BATCHES_PER_DAY))
      .replace('{left}', String(batchLeft))}`;
  }

  return (
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
        <Text style={styles.buttonText} numberOfLines={1}>
          {loading
            ? t.common.loading
            : inCooldown
              ? t.main.balance.batchCooldown.replace('{minutes}', String(cooldownMinutes))
              : atDailyLimit
                ? t.main.balance.maxAdsReached
                : t.main.balance.watchAdBtn}
        </Text>
        <Text style={styles.buttonSubtext} numberOfLines={4}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
