import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Настройка QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Повторять запрос 2 раза при ошибке
      staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
      gcTime: 10 * 60 * 1000, // 10 минут - время хранения в кеше (было cacheTime)
      refetchOnWindowFocus: false, // Не перезагружать при фокусе на приложении
      refetchOnReconnect: true, // Перезагрузить при восстановлении сети
    },
    mutations: {
      retry: 1, // Повторять мутацию 1 раз при ошибке
    },
  },
});

interface ApiProviderProps {
  children: React.ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export { queryClient };
