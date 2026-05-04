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
      if (__DEV__) console.log('[Socket] ⚠️ Already connected, skipping');
      return Promise.resolve();
    }

    if (__DEV__) console.log('[Socket] 🔌 Starting connection...');
    const token = await apiClient.getToken();
    if (!token) {
      console.error('[Socket] ❌ No token found, cannot connect');
      return Promise.reject(new Error('No token found'));
    }

    const socketUrl = API_CONFIG.SOCKET_URL;

    if (__DEV__) console.log('[Socket] 🔌 Connecting to:', socketUrl);

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    if (__DEV__) console.log('[Socket] ✅ Socket instance created, setting up listeners...');
    this.setupEventListeners();

    // Возвращаем промис, который резолвится при подключении
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (__DEV__) console.error('[Socket] ❌ Connection timeout (10s)');
        reject(new Error('Connection timeout'));
      }, 10000);

      this.socket?.once('connect', () => {
        clearTimeout(timeout);
        if (__DEV__) console.log('[Socket] ✅ Connection promise resolved');
        resolve();
      });

      this.socket?.once('connect_error', (error) => {
        clearTimeout(timeout);
        if (__DEV__) console.error('[Socket] ❌ Connection promise rejected:', error.message);
        reject(error);
      });
    });
  }

  // Настройка базовых событий соединения
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      if (__DEV__) console.log('[Socket] ✅ CONNECTED SUCCESSFULLY');
      this.reconnectAttempts = 0;

      if (__DEV__) {
        this.socket?.onAny((eventName) => {
          console.log(`[Socket] 📨 EVENT: ${eventName}`);
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      if (__DEV__) console.log('[Socket] ❌ DISCONNECTED, reason:', reason);
    });

    this.socket.on('connect_error', (error) => {
      if (__DEV__) console.error('[Socket] ❌ CONNECTION ERROR:', error.message);
      this.reconnectAttempts++;

      if (__DEV__ && this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] ❌ MAX RECONNECTION ATTEMPTS REACHED');
      }
    });

    this.socket.on('error', (error) => {
      if (__DEV__) console.error('[Socket] ❌ ERROR:', error);
    });
  }

  // Отключение от сервера
  disconnect(): void {
    if (this.socket) {
      if (__DEV__) console.log('[Socket] Disconnecting...');
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
      if (__DEV__) console.error('[Socket] ❌ Not connected - socket is null');
      return;
    }

    if (!this.socket.connected) {
      if (__DEV__) console.error('[Socket] ❌ Socket exists but not connected');
      return;
    }

    if (__DEV__) console.log('[Socket] 📤 Sending message to:', data.receiverId);
    this.socket.emit('sendPrivateMessage', data);
  }

  // Отметить сообщения как прочитанные
  markAsRead(partnerId: number): void {
    if (!this.socket) {
      if (__DEV__) console.error('[Socket] Not connected');
      return;
    }

    if (__DEV__) console.log('[Socket] Marking as read, partner:', partnerId);
    this.socket.emit('markAsRead', { partnerId });
  }

  // Индикатор печати
  sendTyping(data: TypingDto): void {
    if (!this.socket) return;

    this.socket.emit('typingPrivate', data);
  }

  // Подписка на новые сообщения
  onNewMessage(callback: (message: PrivateMessage) => void): void {
    if (!this.socket) {
      if (__DEV__) console.error('[Socket] ❌ Cannot subscribe to newPrivateMessage - socket is null');
      return;
    }

    if (__DEV__) console.log('[Socket] ✅ Subscribing to newPrivateMessage event');
    this.socket.on('newPrivateMessage', (message: PrivateMessage) => {
      if (__DEV__) console.log('[Socket] 📨 newPrivateMessage from:', message.senderId);
      callback(message);
    });
  }

  // Подписка на подтверждение отправки
  onMessageSent(callback: (message: PrivateMessage) => void): void {
    if (!this.socket) {
      if (__DEV__) console.error('[Socket] ❌ Cannot subscribe to privateMessageSent - socket is null');
      return;
    }

    if (__DEV__) console.log('[Socket] ✅ Subscribing to privateMessageSent event');
    this.socket.on('privateMessageSent', (message: PrivateMessage) => {
      if (__DEV__) console.log('[Socket] 📤 privateMessageSent:', message.id);
      callback(message);
    });
  }

  // Подписка на прочтение сообщений
  onMessagesRead(callback: (data: SocketReadEvent) => void): void {
    if (!this.socket) return;

    this.socket.on('messagesRead', (data: SocketReadEvent) => {
      if (__DEV__) console.log('[Socket] Messages marked as read:', data);
      callback(data);
    });
  }

  // Подписка на индикатор печати
  onUserTyping(callback: (data: SocketTypingEvent) => void): void {
    if (!this.socket) return;

    this.socket.on('userTypingPrivate', (data: SocketTypingEvent) => {
      if (__DEV__) console.log('[Socket] User typing:', data);
      callback(data);
    });
  }

  // Подписка на приватные уведомления
  onPrivateNotification(callback: (data: SocketNotificationEvent) => void): void {
    if (!this.socket) return;

    this.socket.on('privateNotification', (data: SocketNotificationEvent) => {
      if (__DEV__) console.log('[Socket] Private notification:', data);
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
