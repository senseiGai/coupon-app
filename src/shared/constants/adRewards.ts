/** Must match coupon-backend/src/bonus/ad-reward.constants.ts */
export const ADS_PER_BATCH = 12;
export const BATCHES_PER_DAY = 5;
export const BATCH_COOLDOWN_MS = 30 * 60 * 1000;
export const MAX_AD_VIEWS_PER_DAY = ADS_PER_BATCH * BATCHES_PER_DAY;
/** 100 просмотров × 0.01 TWA = 1 TWA */
export const VIEWS_PER_TWA = 100;
export const REWARD_PER_AD_VIEW = 0.01;
export const AD_PERIOD_RESET_HOUR = 12;

export function formatRewardPerViewLabel(locale = 'ru-RU'): string {
  return `+${REWARD_PER_AD_VIEW.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TWA`;
}

/** MM:SS до следующего блока рекламы */
/** Когда API не отдаёт batchCooldownUntil — считаем по lastBatchCompletedAt. */
export function resolveBatchCooldownUntil(
  batchCooldownUntil: string | null | undefined,
  currentAdViewsToday: number,
  lastBatchCompletedAt: string | null | undefined,
  adsPerBatch: number = ADS_PER_BATCH,
): string | null {
  if (batchCooldownUntil) {
    const left = formatCooldownCountdown(batchCooldownUntil);
    if (left) {
      return batchCooldownUntil;
    }
  }
  if (!lastBatchCompletedAt || currentAdViewsToday <= 0) {
    return null;
  }
  if (currentAdViewsToday % adsPerBatch !== 0) {
    return null;
  }
  const untilMs = new Date(lastBatchCompletedAt).getTime() + BATCH_COOLDOWN_MS;
  if (untilMs <= Date.now()) {
    return null;
  }
  return new Date(untilMs).toISOString();
}

function viewsInCurrentBatch(currentAdViewsToday: number): number {
  return currentAdViewsToday % ADS_PER_BATCH;
}

function isBetweenBatches(currentAdViewsToday: number): boolean {
  return currentAdViewsToday > 0 && currentAdViewsToday % ADS_PER_BATCH === 0;
}

function batchesCompleted(currentAdViewsToday: number): number {
  return Math.floor(currentAdViewsToday / ADS_PER_BATCH);
}

function batchRemainingViews(currentAdViewsToday: number): number {
  const inBatch = viewsInCurrentBatch(currentAdViewsToday);
  if (inBatch === 0 && currentAdViewsToday > 0) {
    return ADS_PER_BATCH;
  }
  return ADS_PER_BATCH - inBatch;
}

/** Локальная квота (12×5, 30 мин) — не зависит от устаревшего API (лимит 5 на сервере). */
export function evaluateClientAdQuota(params: {
  currentAdViewsToday: number;
  lastBatchCompletedAt?: string | null;
  batchCooldownUntil?: string | null;
  localCooldownUntil?: string | null;
  now?: Date;
}): {
  allowed: boolean;
  reason: string | null;
  remaining: number;
  batchRemaining: number;
  batchCooldownUntil: string | null;
} {
  const now = params.now ?? new Date();
  const current = Math.max(0, params.currentAdViewsToday);
  const maxAds = MAX_AD_VIEWS_PER_DAY;
  const remaining = Math.max(0, maxAds - current);
  const batchRem = batchRemainingViews(current);
  const cooldownUntilIso = getEffectiveBatchCooldownUntil({
    batchCooldownUntil: params.batchCooldownUntil,
    currentAdViewsToday: current,
    lastBatchCompletedAt: params.lastBatchCompletedAt,
    localCooldownUntil: params.localCooldownUntil,
  });
  const cooldownActive = !!cooldownUntilIso && !!formatCooldownCountdown(cooldownUntilIso);

  if (current >= maxAds) {
    return {
      allowed: false,
      reason: `Дневной лимит: ${maxAds} просмотров`,
      remaining: 0,
      batchRemaining: 0,
      batchCooldownUntil: null,
    };
  }

  if (batchesCompleted(current) >= BATCHES_PER_DAY && isBetweenBatches(current)) {
    return {
      allowed: false,
      reason: `Лимит блоков: ${BATCHES_PER_DAY}×${ADS_PER_BATCH}`,
      remaining: 0,
      batchRemaining: 0,
      batchCooldownUntil: null,
    };
  }

  if (cooldownActive && cooldownUntilIso) {
    const minutes = Math.ceil((new Date(cooldownUntilIso).getTime() - now.getTime()) / 60000);
    return {
      allowed: false,
      reason: `Перерыв между блоками (~${minutes} мин)`,
      remaining,
      batchRemaining: batchRem,
      batchCooldownUntil: cooldownUntilIso,
    };
  }

  /** После 12/24/… без метки паузы — блокируем (таймер включится на клиенте). */
  if (isBetweenBatches(current)) {
    const syntheticUntil = new Date(now.getTime() + BATCH_COOLDOWN_MS).toISOString();
    return {
      allowed: false,
      reason: 'Перерыв между блоками (30 мин)',
      remaining,
      batchRemaining: batchRem,
      batchCooldownUntil: syntheticUntil,
    };
  }

  return {
    allowed: true,
    reason: null,
    remaining,
    batchRemaining: batchRem,
    batchCooldownUntil: null,
  };
}

export function formatCooldownCountdown(untilIso: string | null | undefined): string | null {
  if (!untilIso) {
    return null;
  }
  const ms = new Date(untilIso).getTime() - Date.now();
  if (ms <= 0) {
    return null;
  }
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

/** Сервер + lastBatchCompletedAt + локальная пауза на телефоне. */
export function getEffectiveBatchCooldownUntil(params: {
  batchCooldownUntil?: string | null;
  currentAdViewsToday: number;
  lastBatchCompletedAt?: string | null;
  localCooldownUntil?: string | null;
  adsPerBatch?: number;
}): string | null {
  const adsPerBatch = params.adsPerBatch ?? ADS_PER_BATCH;
  const candidates: string[] = [];

  const fromApi = resolveBatchCooldownUntil(
    params.batchCooldownUntil,
    params.currentAdViewsToday,
    params.lastBatchCompletedAt,
    adsPerBatch,
  );
  if (fromApi && formatCooldownCountdown(fromApi)) {
    candidates.push(fromApi);
  }

  if (params.localCooldownUntil && formatCooldownCountdown(params.localCooldownUntil)) {
    candidates.push(params.localCooldownUntil);
  }

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((latest, iso) =>
    new Date(iso).getTime() > new Date(latest).getTime() ? iso : latest,
  );
}

export function isBatchBreakViews(currentAdViewsToday: number, adsPerBatch = ADS_PER_BATCH): boolean {
  return currentAdViewsToday > 0 && currentAdViewsToday % adsPerBatch === 0;
}

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
