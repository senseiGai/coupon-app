import { Platform } from 'react-native';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

// ID рекламных блоков для Android
// ВАЖНО: Замените на свои реальные ID после регистрации в AdMob
const AD_UNIT_IDS = {
  android: {
    rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
  },
  ios: {
    rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
  },
};

class AdMobService {
  private rewardedAd: RewardedAd | null = null;
  private isLoading = false;
  private isLoaded = false;

  constructor() {
    this.initializeRewardedAd();
  }

  private initializeRewardedAd() {
    const adUnitId =
      Platform.OS === 'android' ? AD_UNIT_IDS.android.rewarded : AD_UNIT_IDS.ios.rewarded;

    this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Слушатели событий
    this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('[AdMob] Rewarded ad loaded');
      this.isLoaded = true;
      this.isLoading = false;
    });

    this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      console.log('[AdMob] User earned reward:', reward);
    });

    this.loadAd();
  }

  private loadAd() {
    if (this.isLoading || this.isLoaded) {
      return;
    }

    this.isLoading = true;
    this.rewardedAd?.load();
  }

  async showRewardedAd(): Promise<{ success: boolean; reward?: any; error?: string }> {
    try {
      if (!this.rewardedAd) {
        throw new Error('Rewarded ad not initialized');
      }

      if (!this.isLoaded) {
        throw new Error('Ad not loaded yet. Please try again.');
      }

      // Показываем рекламу
      await this.rewardedAd.show();

      // После показа перезагружаем рекламу для следующего раза
      this.isLoaded = false;
      this.initializeRewardedAd();

      return { success: true };
    } catch (error: any) {
      console.error('[AdMob] Error showing rewarded ad:', error);

      // Пытаемся загрузить рекламу снова
      this.isLoaded = false;
      this.loadAd();

      return {
        success: false,
        error: error.message || 'Failed to show ad',
      };
    }
  }

  isAdReady(): boolean {
    return this.isLoaded;
  }

  // Предзагрузка рекламы
  preloadAd() {
    if (!this.isLoaded && !this.isLoading) {
      this.loadAd();
    }
  }
}

export const admobService = new AdMobService();
