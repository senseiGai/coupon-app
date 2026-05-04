import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { getRewardedAdUnitId } from '@/shared/config/adsConfig';

export type RewardedAdResult = {
  success: boolean;
  /** SDK зафиксировал положенную награду (EARNED_REWARD). */
  earned: boolean;
  error?: string;
};

/**
 * Rewarded + SSV: custom_data из POST /bonus/ad/request передаётся в AdMob.
 * После earned === true вызовите claim на бэкенде (fallback к SSV).
 */
export async function showRewardedAd(customData: string): Promise<RewardedAdResult> {
  const adUnitId = getRewardedAdUnitId();

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
      resolve(result);
    };

    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      serverSideVerificationOptions: {
        customData,
      },
    });

    unsubs.push(
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        rewarded
          .show()
          .catch((e: Error) =>
            finish({ success: false, earned: false, error: e?.message || 'show failed' })
          );
      })
    );

    unsubs.push(
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      })
    );

    unsubs.push(
      rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        finish({ success: true, earned });
      })
    );

    unsubs.push(
      rewarded.addAdEventListener(AdEventType.ERROR, (err) => {
        finish({ success: false, earned, error: err?.message || 'ad error' });
      })
    );

    rewarded.load();
  });
}
