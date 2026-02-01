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
      console.log('[Socket] ⚠️ Already connected, skipping');
      console.log('[Socket]    Socket ID:', this.socket.id);
      return Promise.resolve();
    }

    console.log('[Socket] 🔌 Starting connection...');
    const token = await apiClient.getToken();
    if (!token) {
      console.error('[Socket] ❌ No token found, cannot connect');
      return Promise.reject(new Error('No token found'));
    }

    const socketUrl = API_CONFIG.SOCKET_URL;

    console.log('[Socket] 🔌 Connecting to:', socketUrl);
    console.log('[Socket]    Token (first 20 chars):', token.substring(0, 20) + '...');

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    console.log('[Socket] ✅ Socket instance created, setting up listeners...');
    this.setupEventListeners();

    // Возвращаем промис, который резолвится при подключении
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('[Socket] ❌ Connection timeout (10s)');
        reject(new Error('Connection timeout'));
      }, 10000);

      this.socket?.once('connect', () => {
        clearTimeout(timeout);
        console.log('[Socket] ✅ Connection promise resolved');
        resolve();
      });

      this.socket?.once('connect_error', (error) => {
        clearTimeout(timeout);
        console.error('[Socket] ❌ Connection promise rejected:', error.message);
        reject(error);
      });
    });
  }

  // Настройка базовых событий соединения
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] ✅ CONNECTED SUCCESSFULLY');
      console.log('[Socket]    Socket ID:', this.socket?.id);
      console.log('[Socket]    Transport:', this.socket?.io.engine.transport.name);
      this.reconnectAttempts = 0;

      // Логируем ВСЕ входящие события для отладки
      this.socket?.onAny((eventName, ...args) => {
        console.log(`[Socket] 📨 EVENT: ${eventName}`);
        console.log(`[Socket]    Args:`, JSON.stringify(args, null, 2));
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] ❌ DISCONNECTED');
      console.log('[Socket]    Reason:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] ❌ CONNECTION ERROR');
      console.error('[Socket]    Message:', error.message);
      console.error('[Socket]    Stack:', error.stack);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] ❌ MAX RECONNECTION ATTEMPTS REACHED');
      }
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] ❌ ERROR:', error);
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
      console.error('[Socket] ❌ Not connected - socket is null');
      return;
    }

    if (!this.socket.connected) {
      console.error('[Socket] ❌ Socket exists but not connected');
      console.log('[Socket]    Socket ID:', this.socket.id);
      console.log('[Socket]    Connected:', this.socket.connected);
      return;
    }

    console.log('[Socket] 📤 SENDING PRIVATE MESSAGE:');
    console.log('  - To:', data.receiverId);
    console.log('  - Message:', data.message);
    console.log('  - Socket connected:', this.socket.connected);
    console.log('  - Socket ID:', this.socket.id);
    this.socket.emit('sendPrivateMessage', data);
    console.log('[Socket] ✅ Message emitted to server');
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
    if (!this.socket) {
      console.error('[Socket] ❌ Cannot subscribe to newPrivateMessage - socket is null');
      return;
    }

    console.log('[Socket] ✅ Subscribing to newPrivateMessage event');
    this.socket.on('newPrivateMessage', (message: PrivateMessage) => {
      console.log('[Socket] 📨 newPrivateMessage EVENT RECEIVED:');
      console.log('  - Raw message object:', JSON.stringify(message, null, 2));
      console.log('  - Message ID:', message.id);
      console.log('  - Sender ID:', message.senderId);
      console.log('  - Receiver ID:', message.receiverId);
      console.log('  - Text:', message.message);
      console.log('  - Created at:', message.createdAt);
      console.log('  - Is read:', message.isRead);
      console.log('[Socket] 📤 Calling callback with message...');
      callback(message);
      console.log('[Socket] ✅ Callback executed');
    });
  }

  // Подписка на подтверждение отправки
  onMessageSent(callback: (message: PrivateMessage) => void): void {
    if (!this.socket) {
      console.error('[Socket] ❌ Cannot subscribe to privateMessageSent - socket is null');
      return;
    }

    console.log('[Socket] ✅ Subscribing to privateMessageSent event');
    this.socket.on('privateMessageSent', (message: PrivateMessage) => {
      console.log('[Socket] 📤 privateMessageSent EVENT RECEIVED:');
      console.log('  - Message ID:', message.id);
      console.log('  - Sender ID:', message.senderId);
      console.log('  - Receiver ID:', message.receiverId);
      console.log('  - Text:', message.message);
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
