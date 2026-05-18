import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const PRODUCTION_UNITS = {
  android: {
    rewarded: 'ca-app-pub-3928197299796226/5368412750',
    interstitial: 'ca-app-pub-3928197299796226/6164354211',
  },
  ios: {
    rewarded: 'ca-app-pub-3928197299796226/5368412750',
    interstitial: 'ca-app-pub-3928197299796226/6164354211',
  },
} as const;

function trimId(value: string | undefined): string | undefined {
  const id = value?.trim();
  return id && id.length > 0 ? id : undefined;
}

/** Rewarded / interstitial unit ids use `/`, app ids use `~`. */
function isAdUnitId(id: string): boolean {
  return /^ca-app-pub-\d+\/\d+$/.test(id);
}

function usesProductionAppId(): boolean {
  const androidAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID ?? '';
  return androidAppId.includes('3928197299796226');
}

/** Если в AdMob перепутаны типы блоков — задайте true в .env */
function shouldSwapRewardedAndInterstitial(): boolean {
  return process.env.EXPO_PUBLIC_ADMOB_SWAP_UNITS === 'true';
}

function pickRewardedId(android: string, ios: string): string {
  if (shouldSwapRewardedAndInterstitial()) {
    return Platform.OS === 'ios' ? PRODUCTION_UNITS.ios.interstitial : PRODUCTION_UNITS.android.interstitial;
  }
  return Platform.OS === 'ios' ? ios : android;
}

function pickInterstitialId(android: string, ios: string): string {
  if (shouldSwapRewardedAndInterstitial()) {
    return Platform.OS === 'ios' ? PRODUCTION_UNITS.ios.rewarded : PRODUCTION_UNITS.android.rewarded;
  }
  return Platform.OS === 'ios' ? ios : android;
}

function rewardedFromEnv(): string | undefined {
  if (Platform.OS === 'android') {
    return trimId(process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID_ID);
  }
  if (Platform.OS === 'ios') {
    return trimId(process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS_ID);
  }
  return undefined;
}

function interstitialFromEnv(): string | undefined {
  if (Platform.OS === 'android') {
    return trimId(process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID_ID);
  }
  if (Platform.OS === 'ios') {
    return trimId(process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS_ID);
  }
  return undefined;
}

export function getRewardedAdUnitId(): string {
  const fromEnv = rewardedFromEnv();
  if (fromEnv && isAdUnitId(fromEnv)) {
    if (shouldSwapRewardedAndInterstitial()) {
      const swapped = interstitialFromEnv();
      if (swapped && isAdUnitId(swapped)) {
        return swapped;
      }
    }
    return fromEnv;
  }
  if (usesProductionAppId()) {
    return pickRewardedId(PRODUCTION_UNITS.android.rewarded, PRODUCTION_UNITS.ios.rewarded);
  }
  return TestIds.REWARDED;
}

export function getInterstitialAdUnitId(): string {
  const fromEnv = interstitialFromEnv();
  if (fromEnv && isAdUnitId(fromEnv)) {
    if (shouldSwapRewardedAndInterstitial()) {
      const swapped = rewardedFromEnv();
      if (swapped && isAdUnitId(swapped)) {
        return swapped;
      }
    }
    return fromEnv;
  }
  if (usesProductionAppId()) {
    return pickInterstitialId(
      PRODUCTION_UNITS.android.interstitial,
      PRODUCTION_UNITS.ios.interstitial,
    );
  }
  return TestIds.INTERSTITIAL;
}
