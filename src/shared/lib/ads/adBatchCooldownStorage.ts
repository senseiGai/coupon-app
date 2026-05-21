import AsyncStorage from '@react-native-async-storage/async-storage';
import { BATCH_COOLDOWN_MS } from '@/shared/constants/adRewards';

const keyForUser = (userId: string | number) => `@ad_batch_cooldown_until_${userId}`;

export async function getLocalBatchCooldownUntil(
  userId: string | number | undefined,
): Promise<string | null> {
  if (userId === undefined || userId === null || userId === '') {
    return null;
  }
  const raw = await AsyncStorage.getItem(keyForUser(userId));
  if (!raw) {
    return null;
  }
  if (new Date(raw).getTime() <= Date.now()) {
    await AsyncStorage.removeItem(keyForUser(userId));
    return null;
  }
  return raw;
}

/** Запускает паузу 30 мин и возвращает ISO-время окончания. */
export async function startLocalBatchCooldown(
  userId: string | number | undefined,
): Promise<string | null> {
  if (userId === undefined || userId === null || userId === '') {
    return null;
  }
  const until = new Date(Date.now() + BATCH_COOLDOWN_MS).toISOString();
  await AsyncStorage.setItem(keyForUser(userId), until);
  return until;
}

export async function clearLocalBatchCooldown(userId: string | number | undefined): Promise<void> {
  if (userId === undefined || userId === null || userId === '') {
    return;
  }
  await AsyncStorage.removeItem(keyForUser(userId));
}
