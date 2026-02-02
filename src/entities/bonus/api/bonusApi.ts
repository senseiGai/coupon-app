import { apiClient } from '@/shared/lib/api/apiClient';
import { API_CONFIG } from '@/shared/config/api';
import {
  BonusBalance,
  BonusLimits,
  BonusTransaction,
} from '@/shared/types/bonus';

export interface CanWatchAdResponse {
  allowed: boolean;
  reason: string | null;
  remaining: number;
}

export interface TransactionsResponse {
  transactions: BonusTransaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface MaxDiscountResponse {
  maxDiscount: number;
  maxBonusToUse: number;
  reason: string;
}

export interface ApplyBonusDto {
  orderId: string;
  orderAmount: number;
  bonusToUse: number;
}

export interface EarnReferralDto {
  referralName?: string;
}

export interface UploadResponse {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
}

class BonusApi {
  /**
   * Получить баланс бонусов
   */
  async getBalance(): Promise<BonusBalance> {
    return apiClient.get<BonusBalance>(API_CONFIG.ENDPOINTS.BONUS.BALANCE);
  }

  /**
   * Получить лимиты пользователя
   */
  async getLimits(): Promise<BonusLimits> {
    return apiClient.get<BonusLimits>(API_CONFIG.ENDPOINTS.BONUS.LIMITS);
  }

  /**
   * Проверить возможность просмотра рекламы
   */
  async canWatchAd(): Promise<CanWatchAdResponse> {
    return apiClient.get<CanWatchAdResponse>(API_CONFIG.ENDPOINTS.BONUS.CAN_WATCH_AD);
  }

  /**
   * Начислить бонусы за просмотр рекламы
   */
  async earnAdViewBonus(): Promise<BonusTransaction> {
    return apiClient.post<BonusTransaction>(API_CONFIG.ENDPOINTS.BONUS.EARN_AD_VIEW);
  }

  /**
   * Начислить бонусы за регистрацию
   */
  async earnRegistrationBonus(): Promise<BonusTransaction> {
    return apiClient.post<BonusTransaction>(API_CONFIG.ENDPOINTS.BONUS.EARN_REGISTRATION);
  }

  /**
   * Начислить бонусы за заполнение профиля
   */
  async earnProfileCompleteBonus(): Promise<BonusTransaction> {
    return apiClient.post<BonusTransaction>(API_CONFIG.ENDPOINTS.BONUS.EARN_PROFILE_COMPLETE);
  }

  /**
   * Начислить бонусы за реферала
   */
  async earnReferralBonus(dto?: EarnReferralDto): Promise<BonusTransaction> {
    return apiClient.post<BonusTransaction>(API_CONFIG.ENDPOINTS.BONUS.EARN_REFERRAL, dto);
  }

  /**
   * Применить бонусы к заказу
   */
  async applyBonusToOrder(dto: ApplyBonusDto): Promise<BonusTransaction> {
    return apiClient.post<BonusTransaction>(API_CONFIG.ENDPOINTS.BONUS.APPLY, dto);
  }

  /**
   * Получить историю транзакций
   */
  async getTransactions(
    limit: number = 50,
    offset: number = 0,
    type?: string
  ): Promise<TransactionsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (type) {
      params.append('type', type);
    }
    return apiClient.get<TransactionsResponse>(
      `${API_CONFIG.ENDPOINTS.BONUS.TRANSACTIONS}?${params.toString()}`
    );
  }

  /**
   * Рассчитать максимальную скидку для заказа
   */
  async calculateMaxDiscount(orderAmount: number): Promise<MaxDiscountResponse> {
    return apiClient.post<MaxDiscountResponse>(
      API_CONFIG.ENDPOINTS.BONUS.CALCULATE_MAX_DISCOUNT,
      { orderAmount }
    );
  }

  /**
   * Загрузить файл
   */
  async uploadFile(
    file: any,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    return apiClient.uploadFile<UploadResponse>(
      API_CONFIG.ENDPOINTS.BONUS.UPLOAD,
      file,
      onProgress
    );
  }
}

export const bonusApi = new BonusApi();
