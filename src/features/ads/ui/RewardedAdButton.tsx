import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Play } from 'lucide-react-native';
import { admobService } from '@/shared/lib/admob';
import { useBonus } from '@/shared/lib/hooks/useBonus';
import { useLanguage } from '@/shared/lib/hooks';
import { BONUS_CONFIG } from '@/shared/types/bonus';
import { wp, hp, fontSize, responsive, sizes } from '@/shared/lib/responsive';

interface RewardedAdButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({ onSuccess, onError }) => {
  const { t } = useLanguage();
  const { limits, earnAdViewBonus, checkCanWatchAd } = useBonus();
  const [loading, setLoading] = useState(false);
  const [adReady, setAdReady] = useState(false);

  useEffect(() => {
    // Проверяем готовность рекламы
    const checkAdReady = () => {
      setAdReady(admobService.isAdReady());
    };

    checkAdReady();
    const interval = setInterval(checkAdReady, 1000);

    // Предзагрузить рекламу
    admobService.preloadAd();

    return () => clearInterval(interval);
  }, []);

  const handleWatchAd = async () => {
    // Проверить лимиты
    const canWatch = await checkCanWatchAd();
    if (!canWatch.allowed) {
      Alert.alert(
        t.main.balance.limitReached,
        canWatch.reason || t.main.balance.limitReachedMessage
      );
      if (onError) onError(canWatch.reason || 'Limit reached');
      return;
    }

    // Проверить готовность рекламы
    if (!adReady) {
      Alert.alert(
        t.main.balance.adLoading,
        t.main.balance.adLoadingMessage
      );
      admobService.preloadAd();
      return;
    }

    try {
      setLoading(true);

      // Показать рекламу
      const result = await admobService.showRewardedAd();

      if (result.success) {
        // Начислить бонусы через API
        const bonusResult = await earnAdViewBonus();

        if (bonusResult.success) {
          Alert.alert(
            t.common.success,
            t.main.balance.bonusReceived.replace('{amount}', String(BONUS_CONFIG.REWARDS.AD_VIEW)),
            [{ text: t.main.balance.great }]
          );
          if (onSuccess) onSuccess();
        } else {
          Alert.alert(
            t.common.error,
            bonusResult.error || t.main.balance.bonusError
          );
          if (onError) onError(bonusResult.error || 'Failed to earn bonus');
        }

        // Предзагрузить следующую рекламу
        admobService.preloadAd();
      } else {
        Alert.alert(t.common.error, result.error || t.main.balance.adError);
        if (onError) onError(result.error || 'Failed to show ad');
      }
    } catch (error: any) {
      console.error('Error watching ad:', error);
      Alert.alert(t.common.error, t.main.balance.generalError);
      if (onError) onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading || !adReady || !!(limits && limits.currentAdViewsToday >= limits.maxAdViewsPerDay);

  const iconSize = responsive({ xs: 20, sm: 22, default: 24 });

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={handleWatchAd}
      disabled={isDisabled}
      activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        {loading ? (
          <ActivityIndicator color="#fff" size={responsive({ xs: 'small', default: 'small' })} />
        ) : (
          <Play size={iconSize} color="#fff" fill="#fff" />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.buttonText} numberOfLines={1}>
          {loading ? t.common.loading : t.main.balance.watchAdBtn}
        </Text>
        <Text style={styles.buttonSubtext} numberOfLines={1}>
          +{BONUS_CONFIG.REWARDS.AD_VIEW} {t.main.balance.bonusesWord}
          {limits && ` (${limits.currentAdViewsToday}/${limits.maxAdViewsPerDay} ${t.main.balance.todayWord})`}
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
    fontSize: fontSize(14),
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
