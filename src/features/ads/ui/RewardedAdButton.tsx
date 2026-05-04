import React, { useState } from 'react';
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
  const [loading, setLoading] = useState(false);

  const handleWatchAd = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(t.common.error, t.main.balance.adError);
      return;
    }

    const canWatch = await checkCanWatchAd();
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
        const amount = String(claim.rewardAmount ?? BONUS_CONFIG.REWARDS.AD_VIEW);
        Alert.alert(t.common.success, t.main.balance.bonusReceived.replace('{amount}', amount), [
          { text: t.main.balance.great },
        ]);
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

  const atDailyLimit = !!(limits && limits.currentAdViewsToday >= limits.maxAdViewsPerDay);
  const isDisabled = loading || atDailyLimit;

  const iconSize = responsive({ xs: 20, sm: 22, default: 24 });

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
          {loading ? t.common.loading : t.main.balance.watchAdBtn}
        </Text>
        <Text style={styles.buttonSubtext} numberOfLines={2}>
          {t.main.balance.watchAdDescription.replace(
            '{amount}',
            String(BONUS_CONFIG.REWARDS.AD_VIEW)
          )}
          {limits
            ? `\n(${limits.currentAdViewsToday}/${limits.maxAdViewsPerDay} ${t.main.balance.todayWord})`
            : ''}
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
