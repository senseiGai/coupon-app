import { apiClient } from '../lib/api/apiClient';

export interface BonusBalance {
  userId: number;
  total: number;
  available: number;
  pending: number;
  lastUpdated: string;
}

export interface BonusLimits {
  maxAdViewsPerDay: number;
  currentAdViewsToday: number;
  lastAdViewDate: string;
  maxDiscountPercent: number;
  bonusExpirationDays: number;
}

export interface BonusTransaction {
  id: string;
  userId: number;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  orderId?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface CanWatchAdResponse {
  allowed: boolean;
  reason: string | null;
  remaining: number;
}

export interface MaxDiscountResponse {
  maxDiscount: number;
  maxBonusToUse: number;
  reason: string;
}

export interface TransactionsResponse {
  transactions: BonusTransaction[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * API для работы с бонусами
 */
export const bonusApi = {
  /**
   * Получить баланс бонусов
   */
  async getBalance(): Promise<BonusBalance> {
    const response = await apiClient.get('/bonus/balance');
    return response.data;
  },

  /**
   * Получить лимиты пользователя
   */
  async getLimits(): Promise<BonusLimits> {
    const response = await apiClient.get('/bonus/limits');
    return response.data;
  },

  /**
   * Проверить возможность просмотра рекламы
   */
  async canWatchAd(): Promise<CanWatchAdResponse> {
    const response = await apiClient.get('/bonus/can-watch-ad');
    return response.data;
  },

  /**
   * Начислить бонусы за просмотр рекламы
   */
  async earnAdViewBonus(): Promise<BonusTransaction> {
    const response = await apiClient.post('/bonus/earn/ad-view');
    return response.data;
  },

  /**
   * Начислить бонусы за регистрацию
   */
  async earnRegistrationBonus(): Promise<BonusTransaction> {
    const response = await apiClient.post('/bonus/earn/registration');
    return response.data;
  },

  /**
   * Начислить бонусы за заполнение профиля
   */
  async earnProfileCompleteBonus(): Promise<BonusTransaction> {
    const response = await apiClient.post('/bonus/earn/profile-complete');
    return response.data;
  },

  /**
   * Начислить бонусы за реферала
   */
  async earnReferralBonus(referralName?: string): Promise<BonusTransaction> {
    const response = await apiClient.post('/bonus/earn/referral', {
      referralName,
    });
    return response.data;
  },

  /**
   * Применить бонусы к заказу
   */
  async applyBonusToOrder(
    orderId: string,
    orderAmount: number,
    bonusToUse: number
  ): Promise<BonusTransaction> {
    const response = await apiClient.post('/bonus/apply', {
      orderId,
      orderAmount,
      bonusToUse,
    });
    return response.data;
  },

  /**
   * Получить историю транзакций
   */
  async getTransactions(
    limit: number = 50,
    offset: number = 0,
    type?: string
  ): Promise<TransactionsResponse> {
    const response = await apiClient.get('/bonus/transactions', {
      params: { limit, offset, type },
    });
    return response.data;
  },

  /**
   * Рассчитать максимальную скидку для заказа
   */
  async calculateMaxDiscount(orderAmount: number): Promise<MaxDiscountResponse> {
    const response = await apiClient.post('/bonus/calculate-max-discount', {
      orderAmount,
    });
    return response.data;
  },
};
