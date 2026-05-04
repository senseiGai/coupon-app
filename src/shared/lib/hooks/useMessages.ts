import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../../../entities/message/model/messageService';
import type { PrivateMessage, SendMessageDto } from '../../types/message';
import { socketService } from '../socket/socketService';

// Query Keys
export const MESSAGE_KEYS = {
  conversations: ['conversations'] as const,
  history: (partnerId: number) => ['messages', 'history', partnerId] as const,
  unreadCount: ['messages', 'unread'] as const,
};

// Получить историю сообщений с пользователем
export const useMessageHistory = (partnerId: number) => {
  return useQuery({
    queryKey: MESSAGE_KEYS.history(partnerId),
    queryFn: () => messageService.getHistory(partnerId),
    enabled: !!partnerId && partnerId > 0,
    staleTime: 30000, // 30 секунд
  });
};

// Получить количество непрочитанных
export const useUnreadCount = () => {
  return useQuery({
    queryKey: MESSAGE_KEYS.unreadCount,
    queryFn: () => messageService.getUnreadCount(),
    staleTime: 60000, // 1 минута
    refetchInterval: 60000, // Обновлять каждую минуту
  });
};

// Отправка сообщения через WebSocket
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageDto) => {
      if (__DEV__) console.log('[useSendMessage] 📤 Starting to send message:', data);
      return new Promise<PrivateMessage>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (__DEV__) console.error('[useSendMessage] ❌ Message send timeout (10s)');
          reject(new Error('Message send timeout'));
        }, 10000);

        // Создаем одноразовый слушатель для этого конкретного сообщения
        const handleMessageSent = (message: PrivateMessage) => {
          if (__DEV__) {
            console.log('[useSendMessage] 📨 Received privateMessageSent event');
            console.log('[useSendMessage]    Expected receiverId:', data.receiverId);
            console.log('[useSendMessage]    Actual receiverId:', message.receiverId);
          }

          // Проверяем что это наше сообщение (по получателю)
          if (message.receiverId === data.receiverId) {
            if (__DEV__) console.log('[useSendMessage] ✅ Message confirmed, resolving promise');
            clearTimeout(timeout);
            // Удаляем слушатель после использования
            socketService.off('privateMessageSent', handleMessageSent);
            resolve(message);
          } else {
            if (__DEV__) console.log('[useSendMessage] ⚠️ Message not for us, waiting...');
          }
        };

        // Подписываемся на событие
        if (__DEV__) console.log('[useSendMessage] 🎧 Subscribing to privateMessageSent');
        socketService.on('privateMessageSent', handleMessageSent);

        // Отправляем через WebSocket
        if (__DEV__) console.log('[useSendMessage] 📡 Calling socketService.sendPrivateMessage');
        socketService.sendPrivateMessage(data);
      });
    },
    onSuccess: (message, variables) => {
      if (__DEV__) {
        console.log('[useSendMessage] ✅ onSuccess - updating cache');
        console.log('[useSendMessage]    Message:', message);
      }

      // Добавляем сообщение в кэш истории
      queryClient.setQueryData<PrivateMessage[]>(
        MESSAGE_KEYS.history(variables.receiverId),
        (old) => {
          const isDuplicate = old?.some((msg) => msg.id === message.id);
          if (isDuplicate) {
            if (__DEV__) console.log('[useSendMessage] ⚠️ Message already in cache, skipping');
            return old || [];
          }
          const updated = old ? [...old, message] : [message];
          if (__DEV__) console.log('[useSendMessage] ✅ Cache updated, count:', updated.length);
          return updated;
        }
      );

      // Обновляем список диалогов
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.conversations });
      if (__DEV__) console.log('[useSendMessage] ✅ Conversations invalidated');
    },
    onError: (error) => {
      if (__DEV__) console.error('[useSendMessage] ❌ onError:', error);
    },
  });
};

// Отметить сообщения как прочитанные
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partnerId: number) => {
      // Отправляем через REST и WebSocket
      socketService.markAsRead(partnerId);
      return messageService.markAsRead(partnerId);
    },
    onSuccess: (_, partnerId) => {
      // Обновляем историю сообщений
      queryClient.setQueryData<PrivateMessage[]>(MESSAGE_KEYS.history(partnerId), (old) => {
        if (!old) return [];
        return old.map((msg) => ({
          ...msg,
          isRead: true,
        }));
      });

      // Обновляем счетчик непрочитанных
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.unreadCount });
    },
  });
};
