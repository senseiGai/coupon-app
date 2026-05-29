import AsyncStorage from '@react-native-async-storage/async-storage';
import { AD_PERIOD_RESET_HOUR, MAX_AD_VIEWS_PER_DAY } from '@/shared/constants/adRewards';

const countKey = (userId: string | number, periodKey: string) =>
  `@ad_views_count_${userId}_${periodKey}`;

/** Ключ ad-day (сброс в 12:00 локального времени устройства). */
export function getClientAdPeriodKey(now = new Date()): string {
  const offsetMin = -now.getTimezoneOffset();
  const localMs = now.getTime() + offsetMin * 60 * 1000;
  const local = new Date(localMs);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const d = local.getUTCDate();
  const hour = local.getUTCHours();

  if (hour < AD_PERIOD_RESET_HOUR) {
    const prev = new Date(Date.UTC(y, m, d - 1));
    const py = prev.getUTCFullYear();
    const pm = String(prev.getUTCMonth() + 1).padStart(2, '0');
    const pd = String(prev.getUTCDate()).padStart(2, '0');
    return `${py}-${pm}-${pd}`;
  }

  const pm = String(m + 1).padStart(2, '0');
  const pd = String(d).padStart(2, '0');
  return `${y}-${pm}-${pd}`;
}

export async function getLocalAdViewsToday(
  userId: string | number | undefined,
  periodKey = getClientAdPeriodKey(),
): Promise<number> {
  if (userId === undefined || userId === null || userId === '') {
    return 0;
  }
  const raw = await AsyncStorage.getItem(countKey(userId, periodKey));
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? Math.min(n, MAX_AD_VIEWS_PER_DAY) : 0;
}

export async function incrementLocalAdViewsToday(
  userId: string | number | undefined,
  periodKey = getClientAdPeriodKey(),
): Promise<number> {
  const current = await getLocalAdViewsToday(userId, periodKey);
  const next = Math.min(MAX_AD_VIEWS_PER_DAY, current + 1);
  if (userId !== undefined && userId !== null && userId !== '') {
    await AsyncStorage.setItem(countKey(userId, periodKey), String(next));
  }
  return next;
}

export async function syncLocalAdViewsFromServer(
  userId: string | number | undefined,
  serverCount: number,
  periodKey = getClientAdPeriodKey(),
): Promise<number> {
  const merged = Math.min(
    MAX_AD_VIEWS_PER_DAY,
    Math.max(0, Number.isFinite(serverCount) ? serverCount : 0),
  );
  if (userId !== undefined && userId !== null && userId !== '') {
    await AsyncStorage.setItem(countKey(userId, periodKey), String(merged));
  }
  return merged;
}
