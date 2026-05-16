/** Must match coupon-backend/src/bonus/ad-reward.constants.ts */
export const ADS_PER_BATCH = 12;
export const BATCHES_PER_DAY = 5;
export const BATCH_COOLDOWN_MS = 30 * 60 * 1000;
export const MAX_AD_VIEWS_PER_DAY = ADS_PER_BATCH * BATCHES_PER_DAY;
export const VIEWS_PER_TWA = 1000;
export const REWARD_PER_AD_VIEW = 0.001;
export const AD_PERIOD_RESET_HOUR = 12;

export function formatTwaAmount(amount: number, locale = 'ru-RU'): string {
  const abs = Math.abs(amount);
  const maxFrac = abs >= 1 ? 2 : abs >= 0.01 ? 3 : 4;
  return `${amount.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFrac,
  })} TWA`;
}

/** Progress toward the next full 1 TWA from fractional balance. */
export function getProgressTowardOneTwa(balance: number): {
  viewsTowardOneTwa: number;
  viewsPerTwa: number;
  progress: number;
} {
  const viewsPerTwa = VIEWS_PER_TWA;
  const fractional = ((balance % 1) + 1) % 1;
  const viewsTowardOneTwa = Math.min(
    viewsPerTwa,
    Math.floor(fractional / REWARD_PER_AD_VIEW + 1e-9),
  );
  const progress = viewsPerTwa > 0 ? viewsTowardOneTwa / viewsPerTwa : 0;
  return { viewsTowardOneTwa, viewsPerTwa, progress };
}
