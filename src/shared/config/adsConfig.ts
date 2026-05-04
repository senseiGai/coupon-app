import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

/**
 * Ad unit IDs from env (EAS / .env). If unset, official Google test units are used.
 * @see https://developers.google.com/admob/android/test-ads
 */
function rewardedFromEnv(): string | undefined {
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID_ID;
  }
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS_ID;
  }
  return undefined;
}

function interstitialFromEnv(): string | undefined {
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID_ID;
  }
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS_ID;
  }
  return undefined;
}

export function getRewardedAdUnitId(): string {
  return rewardedFromEnv() ?? TestIds.REWARDED;
}

export function getInterstitialAdUnitId(): string {
  return interstitialFromEnv() ?? TestIds.INTERSTITIAL;
}
