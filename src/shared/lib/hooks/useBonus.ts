import { useState, useEffect, useCallback } from 'react';
import { bonusApi } from '@/entities/bonus';
import {
  BonusBalance,
  BonusLimits,
  BonusTransaction,
  BonusShopItem,
  BonusShopPurchase,
  AdViewRequest,
  AdRewardResponse,
} from '@/shared/types/bonus';

export const useBonus = () => {
  const [balance, setBalance] = useState<BonusBalance | null>(null);
  const [limits, setLimits] = useState<BonusLimits | null>(null);
  const [transactions, setTransactions] = useState<BonusTransaction[]>([]);
  const [shopItems, setShopItems] = useState<BonusShopItem[]>([]);
  const [myPurchases, setMyPurchases] = useState<BonusShopPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузить баланс
  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bonusApi.getBalance();
      setBalance(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load balance');
      console.error('Failed to load balance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить лимиты
  const fetchLimits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bonusApi.getLimits();
      setLimits(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load limits');
      console.error('Failed to load limits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить транзакции
  const fetchTransactions = useCallback(async (limit = 50, offset = 0) => {
    try {
      setLoading(true);
      const data = await bonusApi.getTransactions(limit, offset);
      setTransactions(data.transactions);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Проверить возможность просмотра рекламы
  const checkCanWatchAd = useCallback(async () => {
    try {
      return await bonusApi.canWatchAd();
    } catch (err: any) {
      console.error('Failed to check ad availability:', err);
      return { allowed: false, reason: 'Failed to check', remaining: 0 };
    }
  }, []);

  // Начислить бонусы за просмотр рекламы (Legacy - без SSV)
  const earnAdViewBonus = useCallback(async () => {
    try {
      setLoading(true);
      const transaction = await bonusApi.earnAdViewBonus();
      await fetchBalance();
      await fetchLimits();
      setError(null);
      return { success: true, transaction };
    } catch (err: any) {
      setError(err.message || 'Failed to earn bonus');
      console.error('Failed to earn ad view bonus:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchBalance, fetchLimits]);

  // ========== SSV Ad Methods ==========

  // SSV Шаг 1: Запросить просмотр рекламы
  const requestAdView = useCallback(async (adNetwork?: string): Promise<AdViewRequest | null> => {
    try {
      setLoading(true);
      const result = await bonusApi.requestAdView(adNetwork);
      setError(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to request ad view');
      console.error('Failed to request ad view:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // SSV Шаг 3 (Fallback): Получить награду за просмотр рекламы
  const claimAdReward = useCallback(
    async (adViewId: string): Promise<AdRewardResponse> => {
      try {
        setLoading(true);
        const result = await bonusApi.rewardAdView(adViewId);
        if (result.success) {
          await fetchBalance();
          await fetchLimits();
        }
        setError(null);
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to claim ad reward');
        console.error('Failed to claim ad reward:', err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchBalance, fetchLimits]
  );

  // Начислить бонусы за регистрацию
  const earnRegistrationBonus = useCallback(async () => {
    try {
      const transaction = await bonusApi.earnRegistrationBonus();
      await fetchBalance();
      return { success: true, transaction };
    } catch (err: any) {
      console.error('Failed to earn registration bonus:', err);
      return { success: false, error: err.message };
    }
  }, [fetchBalance]);

  // Начислить бонусы за заполнение профиля
  const earnProfileCompleteBonus = useCallback(async () => {
    try {
      const transaction = await bonusApi.earnProfileCompleteBonus();
      await fetchBalance();
      return { success: true, transaction };
    } catch (err: any) {
      console.error('Failed to earn profile complete bonus:', err);
      return { success: false, error: err.message };
    }
  }, [fetchBalance]);

  // Начислить бонусы за реферала
  const earnReferralBonus = useCallback(
    async (referralName?: string) => {
      try {
        const transaction = await bonusApi.earnReferralBonus(
          referralName ? { referralName } : undefined
        );
        await fetchBalance();
        return { success: true, transaction };
      } catch (err: any) {
        console.error('Failed to earn referral bonus:', err);
        return { success: false, error: err.message };
      }
    },
    [fetchBalance]
  );

  // Применить бонусы к заказу
  const applyBonusToOrder = useCallback(
    async (orderId: string, orderAmount: number, bonusToUse: number) => {
      try {
        setLoading(true);
        const transaction = await bonusApi.applyBonusToOrder({
          orderId,
          orderAmount,
          bonusToUse,
        });
        await fetchBalance();
        setError(null);
        return { success: true, transaction };
      } catch (err: any) {
        setError(err.message || 'Failed to apply bonus');
        console.error('Failed to apply bonus to order:', err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchBalance]
  );

  // Рассчитать максимальную скидку
  const calculateMaxDiscount = useCallback(async (orderAmount: number) => {
    try {
      return await bonusApi.calculateMaxDiscount(orderAmount);
    } catch (err: any) {
      console.error('Failed to calculate max discount:', err);
      return { maxDiscount: 0, maxBonusToUse: 0, reason: 'Failed to calculate' };
    }
  }, []);

  // Загрузить файл
  const uploadFile = useCallback(
    async (file: any, onProgress?: (progress: number) => void) => {
      try {
        setLoading(true);
        const result = await bonusApi.uploadFile(file, onProgress);
        setError(null);
        return { success: true, data: result };
      } catch (err: any) {
        setError(err.message || 'Failed to upload file');
        console.error('Failed to upload file:', err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ========== Bonus Shop Methods ==========

  // Загрузить товары магазина
  const fetchShopItems = useCallback(async () => {
    try {
      setLoading(true);
      const items = await bonusApi.getShopItems();
      setShopItems(items);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load shop items');
      console.error('Failed to load shop items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить мои покупки
  const fetchMyPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const purchases = await bonusApi.getMyPurchases();
      setMyPurchases(purchases);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load purchases');
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Купить товар в магазине
  const purchaseShopItem = useCallback(
    async (itemId: number) => {
      try {
        setLoading(true);
        const result = await bonusApi.purchaseItem(itemId);
        await fetchBalance();
        await fetchMyPurchases();
        setError(null);
        return { success: true, data: result };
      } catch (err: any) {
        setError(err.message || 'Failed to purchase item');
        console.error('Failed to purchase item:', err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchBalance, fetchMyPurchases]
  );

  // Загрузить данные при монтировании
  useEffect(() => {
    fetchBalance();
    fetchLimits();
    fetchTransactions();
  }, [fetchBalance, fetchLimits, fetchTransactions]);

  return {
    // State
    balance,
    limits,
    transactions,
    shopItems,
    myPurchases,
    loading,
    error,
    // Fetch methods
    fetchBalance,
    fetchLimits,
    fetchTransactions,
    // Ad methods
    checkCanWatchAd,
    earnAdViewBonus,
    requestAdView,
    claimAdReward,
    // Earn methods
    earnRegistrationBonus,
    earnProfileCompleteBonus,
    earnReferralBonus,
    // Order methods
    applyBonusToOrder,
    calculateMaxDiscount,
    // Upload
    uploadFile,
    // Shop methods
    fetchShopItems,
    fetchMyPurchases,
    purchaseShopItem,
  };
};
