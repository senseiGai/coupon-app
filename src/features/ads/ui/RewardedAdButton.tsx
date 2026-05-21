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
import { useFocusEffect } from '@react-navigation/native';
import { Play, Clock } from 'lucide-react-native';
import { showRewardedAd, preloadRewardedAd } from '@/shared/lib/admob';
import { useBonus } from '@/shared/lib/hooks/useBonus';
import { useLanguage } from '@/shared/lib/hooks';
import { BONUS_CONFIG } from '@/shared/types/bonus';
import {
  formatTwaAmount,
  formatRewardPerViewLabel,
  formatCooldownCountdown,
  getEffectiveBatchCooldownUntil,
  evaluateClientAdQuota,
  isBatchBreakViews,
  REWARD_PER_AD_VIEW,
  ADS_PER_BATCH,
  BATCHES_PER_DAY,
  MAX_AD_VIEWS_PER_DAY,
} from '@/shared/constants/adRewards';
import {
  getLocalBatchCooldownUntil,
  startLocalBatchCooldown,
  clearLocalBatchCooldown,
} from '@/shared/lib/ads/adBatchCooldownStorage';
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
  const userId = profile?.id;
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<CanWatchAdResponse | null>(null);
  const [localCooldownUntil, setLocalCooldownUntil] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const adsPerBatch = ADS_PER_BATCH;
  const batchesPerDay = BATCHES_PER_DAY;
  const maxViews = MAX_AD_VIEWS_PER_DAY;
  const currentViews = quota?.currentAdViewsToday ?? limits?.currentAdViewsToday ?? 0;

  const loadLocalCooldown = useCallback(async () => {
    const stored = await getLocalBatchCooldownUntil(userId);
    setLocalCooldownUntil(stored);
    return stored;
  }, [userId]);

  useEffect(() => {
    void loadLocalCooldown();
    preloadRewardedAd();
  }, [loadLocalCooldown]);

  useFocusEffect(
    useCallback(() => {
      void fetchLimits();
      void loadLocalCooldown();
    }, [fetchLimits, loadLocalCooldown]),
  );

  const cooldownUntilIso = getEffectiveBatchCooldownUntil({
    batchCooldownUntil: quota?.batchCooldownUntil ?? limits?.batchCooldownUntil,
    currentAdViewsToday: currentViews,
    lastBatchCompletedAt: limits?.lastBatchCompletedAt,
    localCooldownUntil,
  });
  const countdown = formatCooldownCountdown(cooldownUntilIso);
  const inCooldown = !!countdown;

  const clientQuota = evaluateClientAdQuota({
    currentAdViewsToday: currentViews,
    lastBatchCompletedAt: limits?.lastBatchCompletedAt,
    batchCooldownUntil: quota?.batchCooldownUntil ?? limits?.batchCooldownUntil,
    localCooldownUntil,
  });

  const refreshQuota = useCallback(async () => {
    const result = await checkCanWatchAd();
    setQuota(result);
    return result;
  }, [checkCanWatchAd]);

  useEffect(() => {
    void refreshQuota();
    const poll = setInterval(() => void refreshQuota(), 20000);
    return () => clearInterval(poll);
  }, [refreshQuota, limits?.currentAdViewsToday, limits?.batchCooldownUntil, localCooldownUntil]);

  /** После 12/24/… просмотров сервер иногда не отдаёт время паузы — включаем локальный таймер. */
  useEffect(() => {
    if (!userId) {
      return;
    }
    if (localCooldownUntil && formatCooldownCountdown(localCooldownUntil)) {
      return;
    }
    if (!isBatchBreakViews(currentViews, adsPerBatch)) {
      return;
    }
    const serverBlocks = quota !== null && !quota.allowed;
    const serverCooldown = quota?.batchCooldownUntil ?? limits?.batchCooldownUntil;
    if (!serverBlocks && !serverCooldown) {
      return;
    }
    void (async () => {
      const until = await startLocalBatchCooldown(userId);
      if (until) {
        setLocalCooldownUntil(until);
      }
    })();
  }, [
    userId,
    localCooldownUntil,
    currentViews,
    adsPerBatch,
    quota?.allowed,
    quota?.batchCooldownUntil,
    limits?.batchCooldownUntil,
  ]);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!cooldownUntilIso) {
      return;
    }
    if (!formatCooldownCountdown(cooldownUntilIso)) {
      void clearLocalBatchCooldown(userId);
      setLocalCooldownUntil(null);
      void refreshQuota();
      void fetchLimits();
    }
  }, [tick, cooldownUntilIso, userId, refreshQuota, fetchLimits]);

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
  const clientBlocked = !clientQuota.allowed;
  const isDisabled = loading || inCooldown || atDailyLimit || clientBlocked;

  const handleWatchAd = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(t.common.error, t.main.balance.adError);
      return;
    }

    const viewsNow =
      limits?.currentAdViewsToday ?? quota?.currentAdViewsToday ?? currentViews;
    const localQuota = evaluateClientAdQuota({
      currentAdViewsToday: viewsNow,
      lastBatchCompletedAt: limits?.lastBatchCompletedAt,
      batchCooldownUntil: quota?.batchCooldownUntil ?? limits?.batchCooldownUntil,
      localCooldownUntil,
    });
    if (!localQuota.allowed) {
      Alert.alert(
        t.main.balance.limitReached,
        localQuota.reason || t.main.balance.limitReachedMessage,
      );
      onError?.(localQuota.reason || 'Limit reached');
      return;
    }

    setLoading(true);
    try {
      const serverQuota = await checkCanWatchAd();
      setQuota(serverQuota);

      const adReq = await requestAdView('admob');
      if (!adReq?.customData) {
        const serverSaysNo =
          serverQuota && !serverQuota.allowed && clientQuota.allowed;
        Alert.alert(
          t.common.error,
          serverSaysNo
            ? t.main.balance.serverQuotaOutdated
            : t.main.balance.bonusError,
        );
        onError?.(serverSaysNo ? 'Server quota outdated' : 'No ad request');
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
        const freshQuota = await refreshQuota();

        const viewsAfter =
          freshQuota?.currentAdViewsToday ?? limits?.currentAdViewsToday ?? viewsNow + 1;

        if (isBatchBreakViews(viewsAfter, adsPerBatch)) {
          const until = await startLocalBatchCooldown(userId);
          if (until) {
            setLocalCooldownUntil(until);
          }
        }

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
  void tick;

  let subtitle = t.main.balance.watchAdDescription.replace('{amount}', formatRewardPerViewLabel());
  if (!inCooldown) {
    subtitle += `\n${t.main.balance.dailyQuota
      .replace('{current}', String(currentViews))
      .replace('{max}', String(maxViews))
      .replace('{perBatch}', String(adsPerBatch))
      .replace('{batches}', String(batchesPerDay))}`;
    subtitle += `\n${t.main.balance.batchProgress
      .replace('{batch}', String(batchNum))
      .replace('{totalBatches}', String(batchesPerDay))
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
    <View>
      {inCooldown && countdown ? (
        <View style={styles.cooldownHero}>
          <Clock size={36} color="#B45309" />
          <Text style={styles.cooldownHeroTitle}>{t.main.balance.cooldownTitle}</Text>
          <Text style={styles.cooldownHeroHint}>{t.main.balance.cooldownSubtitle}</Text>
          <Text style={styles.cooldownHeroTimer}>{countdown}</Text>
          <Text style={styles.cooldownHeroSub}>
            {t.main.balance.nextAdCooldown.replace('{time}', countdown)}
          </Text>
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
          {!inCooldown ? (
            <Text style={styles.buttonSubtext} numberOfLines={6}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cooldownHero: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: wp(16),
    paddingVertical: hp(20),
    paddingHorizontal: wp(16),
    marginBottom: hp(14),
  },
  cooldownHeroTitle: {
    fontSize: fontSize(16),
    fontWeight: '700',
    color: '#92400E',
    marginTop: hp(8),
    textAlign: 'center',
  },
  cooldownHeroHint: {
    fontSize: fontSize(13),
    color: '#B45309',
    marginTop: hp(4),
    textAlign: 'center',
  },
  cooldownHeroTimer: {
    fontSize: fontSize(48),
    fontWeight: '800',
    color: '#D97706',
    marginTop: hp(12),
    fontVariant: ['tabular-nums'],
  },
  cooldownHeroSub: {
    fontSize: fontSize(14),
    color: '#92400E',
    marginTop: hp(8),
    textAlign: 'center',
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
