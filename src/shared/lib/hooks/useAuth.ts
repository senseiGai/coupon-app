import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../../entities/auth/model/authService';
import { RegisterDto, LoginDto } from '../../types/auth';

export const AUTH_KEYS = {
  profile: ['auth', 'profile'] as const,
  token: ['auth', 'token'] as const,
};

// ===== Queries =====
export const useProfile = () => {
  return useQuery({
    queryKey: AUTH_KEYS.profile,
    queryFn: () => authService.getProfile(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useIsAuthenticated = () => {
  return useQuery({
    queryKey: AUTH_KEYS.token,
    queryFn: () => authService.isAuthenticated(),
    staleTime: 0, // Всегда проверять актуальность
    refetchInterval: 1000, // Проверять каждую секунду
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ===== Mutations =====
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.token });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.token });
    },
  });
};

export const useAdminLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDto) => authService.adminLogin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.token });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      // Очищаем весь кэш
      queryClient.clear();
      // Явно инвалидируем и перезапрашиваем статус авторизации
      await queryClient.invalidateQueries({ queryKey: AUTH_KEYS.token });
      await queryClient.refetchQueries({ queryKey: AUTH_KEYS.token });
    },
  });
};
