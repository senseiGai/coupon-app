import { apiClient } from '../../../shared/lib/api/apiClient';
import { API_CONFIG } from '../../../shared/config/api';
import { Tour, CreateTourDto, UpdateTourDto } from '../../../shared/types/tour';

class TourService {
  async getAllTours(): Promise<Tour[]> {
    return apiClient.get<Tour[]>(API_CONFIG.ENDPOINTS.TOURS);
  }

  async getTourById(id: number): Promise<Tour> {
    return apiClient.get<Tour>(API_CONFIG.ENDPOINTS.TOURS_BY_ID(id));
  }
}

export const tourService = new TourService();
