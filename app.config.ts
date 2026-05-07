import type { ExpoConfig } from 'expo/config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withAdMobMediationAndroid = require('./plugins/withAdMobMediationAndroid') as (
  config: ExpoConfig
) => ExpoConfig;

const ADMOB_ANDROID_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || 'ca-app-pub-3940256099942544~3347511713';

const ADMOB_IOS_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || 'ca-app-pub-3940256099942544~1458002511';

export default (): ExpoConfig =>
  ({
    name: 'Travel with Alina',
    slug: 'travel-with-alina',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/logo.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    web: {
      favicon: './assets/favicon.png',
    },
    experiments: {
      tsconfigPaths: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/logo.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.travelwithalina.app',
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            extraMavenRepos: ['https://android-sdk.is.com/'],
          },
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: ADMOB_ANDROID_APP_ID,
          iosAppId: ADMOB_IOS_APP_ID,
        },
      ],
      withAdMobMediationAndroid,
    ],
    extra: {
      eas: {
        projectId: '93d81310-3bcb-4f3b-b383-bc12923984cd',
      },
    },
  }) as ExpoConfig;
