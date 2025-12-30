import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../../config/api';
import { apiClient } from '../api/apiClient';
import type {
  PrivateMessage,
  SendMessageDto,
  TypingDto,
  SocketTypingEvent,
  SocketReadEvent,
  SocketNotificationEvent,
} from '../../types/message';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Подключение к WebSocket серверу
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    const token = await apiClient.getToken();
    if (!token) {
      console.error('[Socket] No token found, cannot connect');
      return;
    }

    const socketUrl = API_CONFIG.BASE_URL.replace('/api', ''); // Убираем /api для WebSocket

    console.log('[Socket] Connecting to:', socketUrl);

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  // Настройка базовых событий соединения
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected successfully');
      this.reconnectAttempts = 0;

      // Логируем ВСЕ входящие события для отладки
      this.socket?.onAny((eventName, ...args) => {
        console.log(`[Socket] Event received: ${eventName}`, args);
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });
  }

  // Отключение от сервера
  disconnect(): void {
    if (this.socket) {
      console.log('[Socket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Проверка подключения
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Отправка приватного сообщения
  sendPrivateMessage(data: SendMessageDto): void {
    if (!this.socket) {
      console.error('[Socket] Not connected');
      return;
    }

    if (!this.socket.connected) {
      console.error('[Socket] Socket exists but not connected');
      return;
    }

    console.log('[Socket] Sending private message:', data);
    console.log('[Socket] Socket connected:', this.socket.connected);
    this.socket.emit('sendPrivateMessage', data);
  }

  // Отметить сообщения как прочитанные
  markAsRead(partnerId: number): void {
    if (!this.socket) {
      console.error('[Socket] Not connected');
      return;
    }

    console.log('[Socket] Marking as read, partner:', partnerId);
    this.socket.emit('markAsRead', { partnerId });
  }

  // Индикатор печати
  sendTyping(data: TypingDto): void {
    if (!this.socket) return;

    this.socket.emit('typingPrivate', data);
  }

  // Подписка на новые сообщения
  onNewMessage(callback: (message: PrivateMessage) => void): void {
    if (!this.socket) return;

    this.socket.on('newPrivateMessage', (message: PrivateMessage) => {
      console.log('[Socket] New private message:', message);
      callback(message);
    });
  }

  // Подписка на подтверждение отправки
  onMessageSent(callback: (message: PrivateMessage) => void): void {
    if (!this.socket) return;

    this.socket.on('privateMessageSent', (message: PrivateMessage) => {
      console.log('[Socket] Message sent confirmed:', message);
      callback(message);
    });
  }

  // Подписка на прочтение сообщений
  onMessagesRead(callback: (data: SocketReadEvent) => void): void {
    if (!this.socket) return;

    this.socket.on('messagesRead', (data: SocketReadEvent) => {
      console.log('[Socket] Messages marked as read:', data);
      callback(data);
    });
  }

  // Подписка на индикатор печати
  onUserTyping(callback: (data: SocketTypingEvent) => void): void {
    if (!this.socket) return;

    this.socket.on('userTypingPrivate', (data: SocketTypingEvent) => {
      console.log('[Socket] User typing:', data);
      callback(data);
    });
  }

  // Подписка на приватные уведомления
  onPrivateNotification(callback: (data: SocketNotificationEvent) => void): void {
    if (!this.socket) return;

    this.socket.on('privateNotification', (data: SocketNotificationEvent) => {
      console.log('[Socket] Private notification:', data);
      callback(data);
    });
  }

  // Отписка от события
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // Подписка на событие один раз
  once(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) return;
    this.socket.once(event, callback);
  }

  // Добавить слушатель события
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  // Отписка от всех событий
  removeAllListeners(): void {
    if (!this.socket) return;

    this.socket.off('newPrivateMessage');
    this.socket.off('privateMessageSent');
    this.socket.off('messagesRead');
    this.socket.off('userTypingPrivate');
    this.socket.off('privateNotification');
  }
}

export const socketService = new SocketService();
