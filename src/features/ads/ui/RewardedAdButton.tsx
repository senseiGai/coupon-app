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
  getHandledBatchBoundary,
  markBatchBoundaryHandled,
} from '@/shared/lib/ads/adBatchCooldownStorage';
import {
  incrementLocalAdViewsToday,
  syncLocalAdViewsFromServer,
  getClientAdPeriodKey,
} from '@/shared/lib/ads/adViewCountStorage';
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
  const {
    limits,
    checkCanWatchAd,
    requestAdView,
    claimAdReward,
    earnAdViewBonus,
    fetchBalance,
    fetchLimits,
  } = useBonus();
  const { data: profile } = useProfile();
  const userId = profile?.id;
  const storageUserKey = userId ?? 'local-device-user';
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<CanWatchAdResponse | null>(null);
  const [localCooldownUntil, setLocalCooldownUntil] = useState<string | null>(null);
  const [localViews, setLocalViews] = useState(0);
  const [handledBatchBoundary, setHandledBatchBoundary] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const adsPerBatch = ADS_PER_BATCH;
  const batchesPerDay = BATCHES_PER_DAY;
  const maxViews = MAX_AD_VIEWS_PER_DAY;
  const serverViews = quota?.currentAdViewsToday ?? limits?.currentAdViewsToday ?? 0;
  const effectiveViews = Math.max(serverViews, localViews);

  const loadLocalCooldown = useCallback(async () => {
    const stored = await getLocalBatchCooldownUntil(storageUserKey);
    setLocalCooldownUntil(stored);
    return stored;
  }, [storageUserKey]);

  const loadHandledBatchBoundary = useCallback(async () => {
    const periodKey = getClientAdPeriodKey();
    const value = await getHandledBatchBoundary(storageUserKey, periodKey);
    setHandledBatchBoundary(value);
    return value;
  }, [storageUserKey]);

  const syncLocalViews = useCallback(async () => {
    const merged = await syncLocalAdViewsFromServer(
      storageUserKey,
      serverViews,
      getClientAdPeriodKey(),
    );
    setLocalViews(merged);
    return merged;
  }, [storageUserKey, serverViews]);

  useEffect(() => {
    void loadLocalCooldown();
    void loadHandledBatchBoundary();
    void syncLocalViews();
    preloadRewardedAd();
  }, [loadLocalCooldown, loadHandledBatchBoundary, syncLocalViews]);

  useFocusEffect(
    useCallback(() => {
      void fetchLimits();
      void loadLocalCooldown();
      void loadHandledBatchBoundary();
    }, [fetchLimits, loadLocalCooldown, loadHandledBatchBoundary]),
  );

  const cooldownUntilIso = getEffectiveBatchCooldownUntil({
    batchCooldownUntil: quota?.batchCooldownUntil ?? limits?.batchCooldownUntil,
    currentAdViewsToday: effectiveViews,
    lastBatchCompletedAt: limits?.lastBatchCompletedAt,
    localCooldownUntil,
  });

  const clientQuota = evaluateClientAdQuota({
    currentAdViewsToday: effectiveViews,
    lastBatchCompletedAt: limits?.lastBatchCompletedAt,
    batchCooldownUntil: quota?.batchCooldownUntil ?? limits?.batchCooldownUntil,
    localCooldownUntil,
  });
  const countdown = formatCooldownCountdown(cooldownUntilIso);
  const inCooldown = !!countdown;

  const refreshQuota = useCallback(async () => {
    const result = await checkCanWatchAd();
    setQuota(result);
    return result;
  }, [checkCanWatchAd]);

  useEffect(() => {
    void refreshQuota();
    const poll = setInterval(() => void refreshQuota(), 20000);
    return () => clearInterval(poll);
  }, [refreshQuota, limits?.currentAdViewsToday, limits?.batchCooldownUntil, localCooldownUntil, serverViews]);

  useEffect(() => {
    void syncLocalViews();
  }, [syncLocalViews, serverViews]);

  /** После 12/24/… всегда включаем локальный таймер 30 мин. */
  useEffect(() => {
    if (!isBatchBreakViews(effectiveViews, adsPerBatch)) {
      return;
    }
    if (handledBatchBoundary === effectiveViews) {
      return;
    }
    if (localCooldownUntil && formatCooldownCountdown(localCooldownUntil)) {
      return;
    }
    void (async () => {
      const until = await startLocalBatchCooldown(storageUserKey);
      if (until) {
        const periodKey = getClientAdPeriodKey();
        await markBatchBoundaryHandled(storageUserKey, periodKey, effectiveViews);
        setHandledBatchBoundary(effectiveViews);
        setLocalCooldownUntil(until);
      }
    })();
  }, [storageUserKey, localCooldownUntil, effectiveViews, adsPerBatch, handledBatchBoundary]);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!cooldownUntilIso) {
      return;
    }
    if (!formatCooldownCountdown(cooldownUntilIso)) {
      void clearLocalBatchCooldown(storageUserKey);
      setLocalCooldownUntil(null);
      void refreshQuota();
      void fetchLimits();
    }
  }, [tick, cooldownUntilIso, storageUserKey, refreshQuota, fetchLimits]);

  const batchLeft =
    effectiveViews > 0 && effectiveViews % adsPerBatch === 0
      ? adsPerBatch
      : adsPerBatch - (effectiveViews % adsPerBatch);
  const batchNum = Math.min(
    batchesPerDay,
    effectiveViews > 0 && effectiveViews % adsPerBatch === 0
      ? Math.floor(effectiveViews / adsPerBatch)
      : Math.floor(effectiveViews / adsPerBatch) + 1,
  );
  const atDailyLimit = effectiveViews >= maxViews;
  const clientBlocked = !clientQuota.allowed;
  const serverMaxViews =
    quota?.maxAdViewsPerDay ?? limits?.maxAdViewsPerDay ?? MAX_AD_VIEWS_PER_DAY;
  const serverUsesOldLimit = serverMaxViews < MAX_AD_VIEWS_PER_DAY;
  const isDisabled = loading || inCooldown || atDailyLimit || clientBlocked;

  const finishRewardUi = useCallback(
    async (creditedAmount: number, viewsAfter: number) => {
      const localAfter = await incrementLocalAdViewsToday(storageUserKey, getClientAdPeriodKey());
      setLocalViews(localAfter);
      if (isBatchBreakViews(localAfter, adsPerBatch)) {
        const until = await startLocalBatchCooldown(storageUserKey);
        if (until) {
          setLocalCooldownUntil(until);
        }
      }
      await fetchBalance();
      await fetchLimits();
      await refreshQuota();
      const displayAmount = formatTwaAmount(creditedAmount);
      Alert.alert(
        t.common.success,
        t.main.balance.bonusReceived.replace('{amount}', displayAmount),
        [{ text: t.main.balance.great }],
      );
      onSuccess?.();
    },
    [
      adsPerBatch,
      storageUserKey,
      fetchBalance,
      fetchLimits,
      refreshQuota,
      t.common.success,
      t.main.balance.bonusReceived,
      t.main.balance.great,
      onSuccess,
    ],
  );

  const handleWatchAd = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(t.common.error, t.main.balance.adError);
      return;
    }

    const viewsNow = Math.max(
      limits?.currentAdViewsToday ?? quota?.currentAdViewsToday ?? 0,
      localViews,
    );
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

      const tryLegacyEarn = async (): Promise<boolean> => {
        const adResult = await showRewardedAd(
          undefined,
          profile?.id ? String(profile.id) : undefined,
        );
        if (!adResult.success) {
          Alert.alert(t.common.error, adResult.error || t.main.balance.adError);
          onError?.(adResult.error || 'Ad failed');
          return true;
        }
        if (!adResult.earned) {
          return true;
        }
        const earn = await earnAdViewBonus();
        if (!earn.success) {
          Alert.alert(t.common.error, earn.error || t.main.balance.serverQuotaOutdated);
          onError?.(earn.error || 'Earn failed');
          return true;
        }
        const credited = normalizeRewardAmount(earn.transaction?.amount);
        const viewsAfter =
          serverQuota?.currentAdViewsToday ?? limits?.currentAdViewsToday ?? viewsNow + 1;
        await finishRewardUi(credited, viewsAfter);
        return true;
      };

      if (serverUsesOldLimit) {
        await tryLegacyEarn();
        return;
      }

      const adReq = await requestAdView('admob');
      if (!adReq?.customData) {
        const serverSaysNo =
          serverQuota && !serverQuota.allowed && localQuota.allowed;
        if (serverSaysNo) {
          await tryLegacyEarn();
          return;
        }
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
        const freshQuota = await refreshQuota();
        const viewsAfter =
          freshQuota?.currentAdViewsToday ?? limits?.currentAdViewsToday ?? viewsNow + 1;
        const credited = normalizeRewardAmount(claim.rewardAmount);
        await finishRewardUi(credited, viewsAfter);
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
      .replace('{current}', String(effectiveViews))
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
      ? t.main.balance.cooldownRemaining.replace('{time}', countdown)
      : atDailyLimit
        ? t.main.balance.dailyLimitReached.replace('{max}', String(maxViews))
        : t.main.balance.watchAdBtn;

  return (
    <View>
      {serverUsesOldLimit ? (
        <View style={styles.serverWarn}>
          <Text style={styles.serverWarnText}>{t.main.balance.serverQuotaOutdated}</Text>
        </View>
      ) : null}

      {inCooldown && countdown ? (
        <View style={styles.cooldownHero}>
          <Clock size={28} color="#B45309" />
          <Text style={styles.cooldownHeroTimer}>{countdown}</Text>
          <Text style={styles.cooldownHeroSub}>
            {t.main.balance.cooldownRemaining.replace('{time}', countdown)}
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
  serverWarn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: wp(12),
    padding: wp(12),
    marginBottom: hp(10),
  },
  serverWarnText: {
    fontSize: fontSize(12),
    color: '#991B1B',
    lineHeight: fontSize(17),
  },
  cooldownHero: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: wp(14),
    paddingVertical: hp(14),
    paddingHorizontal: wp(14),
    marginBottom: hp(12),
  },
  cooldownHeroTimer: {
    fontSize: fontSize(32),
    fontWeight: '800',
    color: '#D97706',
    marginTop: hp(8),
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  cooldownHeroSub: {
    fontSize: fontSize(12),
    color: '#92400E',
    marginTop: hp(6),
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
