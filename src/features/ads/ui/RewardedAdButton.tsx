import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Play } from 'lucide-react-native';
import { admobService } from '@/shared/lib/admob';
import { useBonus } from '@/shared/lib/hooks/useBonus';
import { BONUS_CONFIG } from '@/shared/types/bonus';

interface RewardedAdButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({ onSuccess, onError }) => {
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
        'Лимит достигнут',
        canWatch.reason || 'Вы достигли дневного лимита просмотров рекламы'
      );
      if (onError) onError(canWatch.reason || 'Limit reached');
      return;
    }

    // Проверить готовность рекламы
    if (!adReady) {
      Alert.alert(
        'Реклама загружается',
        'Реклама еще загружается. Попробуйте через несколько секунд.'
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
          Alert.alert('Успех!', `Вы получили ${BONUS_CONFIG.REWARDS.AD_VIEW} бонусов!`, [
            { text: 'Отлично!' },
          ]);
          if (onSuccess) onSuccess();
        } else {
          Alert.alert(
            'Ошибка',
            bonusResult.error || 'Не удалось начислить бонусы. Попробуйте позже.'
          );
          if (onError) onError(bonusResult.error || 'Failed to earn bonus');
        }

        // Предзагрузить следующую рекламу
        admobService.preloadAd();
      } else {
        Alert.alert('Ошибка', result.error || 'Не удалось показать рекламу. Попробуйте позже.');
        if (onError) onError(result.error || 'Failed to show ad');
      }
    } catch (error: any) {
      console.error('Error watching ad:', error);
      Alert.alert('Ошибка', 'Произошла ошибка. Попробуйте позже.');
      if (onError) onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading || !adReady || (limits && limits.currentAdViewsToday >= limits.maxAdViewsPerDay);

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={handleWatchAd}
      disabled={isDisabled}
      activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        {loading ? <ActivityIndicator color="#fff" /> : <Play size={24} color="#fff" fill="#fff" />}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.buttonText}>{loading ? 'Загрузка...' : 'Смотреть рекламу'}</Text>
        <Text style={styles.buttonSubtext}>
          +{BONUS_CONFIG.REWARDS.AD_VIEW} бонусов
          {limits && ` (${limits.currentAdViewsToday}/${limits.maxAdViewsPerDay} сегодня)`}
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
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
