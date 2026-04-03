// AdMob removed — stub service to prevent import errors

class AdMobService {
  isAdReady(): boolean {
    return false;
  }

  preloadAd() {}

  async showRewardedAd(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Ads are not available' };
  }
}

export const admobService = new AdMobService();
