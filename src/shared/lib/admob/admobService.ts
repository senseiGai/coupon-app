import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { getRewardedAdUnitId } from '@/shared/config/adsConfig';

export type RewardedAdResult = {
  success: boolean;
  earned: boolean;
  error?: string;
};

let preloadInstance: RewardedAd | null = null;

function isFormatMismatchError(message: string | undefined): boolean {
  if (!message) {
    return false;
  }
  const m = message.toLowerCase();
  return m.includes("doesn't match format") || m.includes('does not match format');
}

function createRewardedInstance(): RewardedAd {
  const adUnitId = getRewardedAdUnitId();
  return RewardedAd.createForAdRequest(adUnitId);
}

/**
 * Предзагрузка rewarded без SSV — снижает задержку перед показом.
 */
export function preloadRewardedAd(): void {
  if (preloadInstance) {
    return;
  }
  preloadInstance = createRewardedInstance();
  preloadInstance.addAdEventListener(AdEventType.ERROR, () => {
    preloadInstance = null;
  });
  preloadInstance.load();
}

function showLoadedRewarded(rewarded: RewardedAd): Promise<RewardedAdResult> {
  return new Promise((resolve) => {
    let settled = false;
    let earned = false;
    const unsubs: (() => void)[] = [];

    const finish = (result: RewardedAdResult) => {
      if (settled) {
        return;
      }
      settled = true;
      unsubs.forEach((u) => u());
      preloadInstance = null;
      preloadRewardedAd();
      resolve(result);
    };

    unsubs.push(
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      }),
    );

    unsubs.push(
      rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        finish({ success: true, earned });
      }),
    );

    unsubs.push(
      rewarded.addAdEventListener(AdEventType.ERROR, (err) => {
        finish({ success: false, earned, error: err?.message || 'ad error' });
      }),
    );

    rewarded
      .show()
      .catch((e: Error) =>
        finish({ success: false, earned: false, error: e?.message || 'show failed' }),
      );
  });
}

function loadAndShowRewarded(rewarded: RewardedAd): Promise<RewardedAdResult> {
  return new Promise((resolve) => {
    let settled = false;
    const unsubs: (() => void)[] = [];

    const finish = (result: RewardedAdResult) => {
      if (settled) {
        return;
      }
      settled = true;
      unsubs.forEach((u) => u());
      resolve(result);
    };

    unsubs.push(
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        void showLoadedRewarded(rewarded).then(finish);
      }),
    );

    unsubs.push(
      rewarded.addAdEventListener(AdEventType.ERROR, (err) => {
        finish({ success: false, earned: false, error: err?.message || 'ad error' });
      }),
    );

    rewarded.load();
  });
}

/**
 * Rewarded-реклама. Награда на сервере через claimAdReward(adViewId), без SSV в SDK
 * (SSV ломает загрузку, если в AdMob не настроен для блока).
 */
export async function showRewardedAd(
  _customData?: string,
  _userId?: string,
): Promise<RewardedAdResult> {
  const adUnitId = getRewardedAdUnitId();
  if (!adUnitId.includes('/')) {
    return {
      success: false,
      earned: false,
      error: 'Invalid rewarded ad unit id (expected ca-app-pub-xxx/yyy)',
    };
  }

  if (preloadInstance?.loaded) {
    const instance = preloadInstance;
    preloadInstance = null;
    return showLoadedRewarded(instance);
  }

  const rewarded = createRewardedInstance();
  const result = await loadAndShowRewarded(rewarded);

  if (!result.success && isFormatMismatchError(result.error)) {
    console.warn(
      '[AdMob] Rewarded format mismatch for unit',
      adUnitId,
      '— проверьте в консоли AdMob, что блок имеет тип Rewarded, не Interstitial.',
    );
  }

  return result;
}

export function isRewardedAdPreloaded(): boolean {
  return preloadInstance?.loaded ?? false;
}
