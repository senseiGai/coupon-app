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
  formatRewardPerViewLabel,
  formatCooldownCountdown,
  REWARD_PER_AD_VIEW,
  ADS_PER_BATCH,
  BATCHES_PER_DAY,
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

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({ onSuccess, onError }) => {
  const { t } = useLanguage();
  const { limits, checkCanWatchAd, requestAdView, claimAdReward, fetchBalance, fetchLimits } =
    useBonus();
  const { data: profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<CanWatchAdResponse | null>(null);
  const [, setTick] = useState(0);

  const cooldownUntilIso = quota?.batchCooldownUntil ?? limits?.batchCooldownUntil ?? null;
  const countdown = formatCooldownCountdown(cooldownUntilIso);
  const inCooldown = !!countdown;

  const refreshQuota = useCallback(async () => {
    const result = await checkCanWatchAd();
    setQuota(result);
  }, [checkCanWatchAd]);

  useEffect(() => {
    void refreshQuota();
  }, [refreshQuota, limits?.currentAdViewsToday, limits?.batchCooldownUntil]);

  useEffect(() => {
    if (!cooldownUntilIso) {
      return;
    }
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [cooldownUntilIso]);

  const rewardPerView =
    limits?.rewardPerView ?? quota?.rewardPerView ?? BONUS_CONFIG.REWARDS.AD_VIEW ?? REWARD_PER_AD_VIEW;
  const atDailyLimit = quota ? !quota.allowed && !inCooldown : false;
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
        const displayReward = formatTwaAmount(rewardPerView);
        Alert.alert(
          t.common.success,
          t.main.balance.bonusReceived.replace('{amount}', displayReward),
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
  const batchLeft = quota?.batchRemaining ?? limits?.batchRemaining ?? ADS_PER_BATCH;
  const currentViews = quota?.currentAdViewsToday ?? limits?.currentAdViewsToday ?? 0;
  const maxViews = quota?.maxAdViewsPerDay ?? limits?.maxAdViewsPerDay ?? BONUS_CONFIG.LIMITS.MAX_AD_VIEWS_PER_DAY;

  let subtitle = t.main.balance.watchAdDescription.replace('{amount}', formatRewardPerViewLabel());
  subtitle += `\n${t.main.balance.dailyQuota
    .replace('{current}', String(currentViews))
    .replace('{max}', String(maxViews))}`;
  if (inCooldown && countdown) {
    subtitle += `\n${t.main.balance.nextAdCooldown.replace('{time}', countdown)}`;
  } else if (batchLeft > 0 && batchLeft < ADS_PER_BATCH) {
    const batchNum = Math.min(BATCHES_PER_DAY, Math.floor(currentViews / ADS_PER_BATCH) + 1);
    subtitle += `\n${t.main.balance.batchProgress
      .replace('{batch}', String(batchNum))
      .replace('{totalBatches}', String(BATCHES_PER_DAY))
      .replace('{left}', String(batchLeft))}`;
  }

  const buttonTitle = loading
    ? t.common.loading
    : inCooldown && countdown
      ? t.main.balance.nextAdCooldown.replace('{time}', countdown)
      : atDailyLimit
        ? t.main.balance.maxAdsReached
        : t.main.balance.watchAdBtn;

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
        <Text style={styles.buttonText} numberOfLines={2}>
          {buttonTitle}
        </Text>
        <Text style={styles.buttonSubtext} numberOfLines={5}>
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
