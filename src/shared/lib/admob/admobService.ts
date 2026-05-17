import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  type RequestOptions,
} from 'react-native-google-mobile-ads';
import { getRewardedAdUnitId } from '@/shared/config/adsConfig';

export type RewardedAdResult = {
  success: boolean;
  earned: boolean;
  error?: string;
};

let preloadInstance: RewardedAd | null = null;
let preloadReady = false;

function buildRequestOptions(customData?: string, userId?: string): RequestOptions | undefined {
  if (!customData?.trim()) {
    return undefined;
  }
  return {
    serverSideVerificationOptions: {
      userId: userId ?? '',
      customData: customData.trim(),
    },
  };
}

/**
 * Предзагрузка rewarded (без SSV) — снижает задержку перед показом.
 */
export function preloadRewardedAd(): void {
  if (preloadInstance) {
    return;
  }
  const adUnitId = getRewardedAdUnitId();
  preloadInstance = RewardedAd.createForAdRequest(adUnitId);
  preloadInstance.addAdEventListener(RewardedAdEventType.LOADED, () => {
    preloadReady = true;
  });
  preloadInstance.addAdEventListener(AdEventType.ERROR, () => {
    preloadReady = false;
    preloadInstance = null;
  });
  preloadInstance.load();
}

/**
 * Rewarded + опциональный SSV (customData из POST /bonus/ad/request).
 */
export async function showRewardedAd(
  customData?: string,
  userId?: string,
): Promise<RewardedAdResult> {
  const adUnitId = getRewardedAdUnitId();
  if (!adUnitId.includes('/')) {
    return {
      success: false,
      earned: false,
      error: 'Invalid rewarded ad unit id (expected ca-app-pub-xxx/yyy)',
    };
  }

  const requestOptions = buildRequestOptions(customData, userId);
  const rewarded = RewardedAd.createForAdRequest(adUnitId, requestOptions);

  return new Promise((resolve) => {
    let settled = false;
    let earned = false;
    const unsubs: (() => void)[] = [];

    const cleanup = () => {
      unsubs.forEach((u) => u());
    };

    const finish = (result: RewardedAdResult) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      preloadInstance = null;
      preloadReady = false;
      preloadRewardedAd();
      resolve(result);
    };

    unsubs.push(
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        rewarded
          .show()
          .catch((e: Error) =>
            finish({ success: false, earned: false, error: e?.message || 'show failed' }),
          );
      }),
    );

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

    rewarded.load();
  });
}

export function isRewardedAdPreloaded(): boolean {
  return preloadReady;
}
