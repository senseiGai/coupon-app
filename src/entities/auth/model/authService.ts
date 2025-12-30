import { apiClient } from '../../../shared/lib/api/apiClient';
import { API_CONFIG } from '../../../shared/config/api';
import {
  RegisterDto,
  LoginDto,
  AuthResponse,
  RegisterResponse,
  ProfileResponse,
} from '../../../shared/types/auth';

class AuthService {
  async register(data: RegisterDto): Promise<RegisterResponse> {
    console.log('[AuthService] Register called with:', data);
    const response = await apiClient.post<RegisterResponse>(
      API_CONFIG.ENDPOINTS.AUTH_REGISTER,
      data
    );
    console.log('[AuthService] Register response:', response);

    // НЕ сохраняем токен после регистрации - пусть войдет через логин
    // После регистрации пользователь должен логинитсся заново
    await apiClient.clearToken();
    console.log('[AuthService] Token cleared after registration');

    return response;
  }

  async registerAdmin(data: RegisterDto): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      API_CONFIG.ENDPOINTS.AUTH_REGISTER_ADMIN,
      data
    );

    if (response.access_token) {
      await apiClient.setToken(response.access_token);
    }

    return response;
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    console.log('[AuthService] Login called with:', data);
    const response = await apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH_LOGIN, data);
    console.log('[AuthService] Login response:', response);

    // Сохраняем токен после входа
    if (response.access_token) {
      await apiClient.setToken(response.access_token);
      console.log('[AuthService] Token saved');
    }

    return response;
  }

  async adminLogin(data: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH_ADMIN_LOGIN,
      data
    );

    if (response.access_token) {
      await apiClient.setToken(response.access_token);
    }

    return response;
  }

  async getProfile(): Promise<ProfileResponse> {
    return apiClient.get<ProfileResponse>(API_CONFIG.ENDPOINTS.AUTH_PROFILE);
  }

  async logout(): Promise<void> {
    await apiClient.clearToken();
  }

  async getToken(): Promise<string | null> {
    return apiClient.getToken();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();
