import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Paperclip } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useLanguage,
  useMessageHistory,
  useSendMessage,
  useMarkAsRead,
  useAdmin,
  useProfile,
} from '../../shared/lib/hooks';
import { socketService } from '../../shared/lib/socket/socketService';
import type { PrivateMessage } from '../../shared/types/message';
import { AirplaneBackground } from '../../shared/ui/AirplaneBackground';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ChatScreen = () => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Получаем текущего пользователя
  const { data: profile } = useProfile();
  const currentUserId = profile?.id;

  // Получаем ID админа из API
  const { data: admin, isLoading: isLoadingAdmin } = useAdmin();
  const ADMIN_ID = admin?.id || 2; // Fallback на 2 если еще загружается

  // Загружаем историю сообщений с админом
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch,
  } = useMessageHistory(ADMIN_ID);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  const isLoading = isLoadingAdmin || isLoadingMessages;

  // Подключаемся к WebSocket при монтировании
  useEffect(() => {
    console.log('[ChatScreen] Connecting to WebSocket...');
    socketService.connect();

    // Подписываемся на новые сообщения
    socketService.onNewMessage((message) => {
      console.log('[ChatScreen] Received new message:', message);
      refetch();

      // Автоматически отмечаем как прочитанные если чат открыт
      if (message.senderId === ADMIN_ID) {
        markAsReadMutation.mutate(ADMIN_ID);
      }
    });

    // Подписываемся на индикатор печати от админа
    socketService.onUserTyping((data) => {
      if (data.userId === ADMIN_ID) {
        setIsTyping(data.isTyping);
      }
    });

    // Отмечаем все сообщения как прочитанные при открытии чата
    markAsReadMutation.mutate(ADMIN_ID);

    return () => {
      socketService.disconnect();
      socketService.removeAllListeners();
    };
  }, [ADMIN_ID]);

  // Автоматический скролл при новых сообщениях
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');

    // Останавливаем индикатор печати
    if (socketService.isConnected()) {
      socketService.sendTyping({
        receiverId: ADMIN_ID,
        isTyping: false,
      });
    }

    try {
      await sendMessageMutation.mutateAsync({
        receiverId: ADMIN_ID,
        message: messageText,
      });

      // Скроллим вниз после отправки
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('[ChatScreen] Failed to send message:', error);
    }
  };

  // Обработка ввода текста с индикатором печати
  const handleTextChange = (text: string) => {
    setInputText(text);

    if (!socketService.isConnected()) return;

    // Отправляем что начали печатать
    socketService.sendTyping({
      receiverId: ADMIN_ID,
      isTyping: true,
    });

    // Сбрасываем предыдущий таймер
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Через 1 секунду бездействия - перестаем печатать
    const timeout = setTimeout(() => {
      socketService.sendTyping({
        receiverId: ADMIN_ID,
        isTyping: false,
      });
    }, 1000);

    setTypingTimeout(timeout);
  };

  // Форматируем сообщения для отображения
  const formatMessages = () => {
    return messages.map((msg) => ({
      id: msg.id,
      text: msg.message,
      isUser: msg.senderId !== ADMIN_ID,
      time: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: msg.isRead,
    }));
  };

  const formattedMessages = formatMessages();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#0EA5E9', '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          {/* Avatar с логотипом */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Image source={require('../../../assets/logo.jpg')} style={styles.logoImage} />
            </View>
            <View style={styles.onlineIndicator} />
          </View>

          {/* Info */}
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{t.main.chat.title}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.headerSubtitle}>
                {t.main.chat.online} • {t.main.chat.fastResponse}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        {/* Фон с самолётиками */}
        <AirplaneBackground />

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}>
          {/* Date */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{t.common.today || 'Today'}</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0EA5E9" />
            </View>
          ) : (
            <>
              {formattedMessages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageWrapper,
                    message.isUser ? styles.userMessageWrapper : styles.supportMessageWrapper,
                  ]}>
                  {/* Аватар поддержки с логотипом */}
                  {!message.isUser && (
                    <View style={styles.messageAvatarContainer}>
                      <View style={styles.messageAvatar}>
                        <Image
                          source={require('../../../assets/logo.jpg')}
                          style={styles.messageLogoImage}
                        />
                      </View>
                    </View>
                  )}

                  {message.isUser ? (
                    <LinearGradient
                      colors={['#0EA5E9', '#0284C7']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.messageBubble, styles.userMessage]}>
                      <Text style={[styles.messageText, styles.userMessageText]}>
                        {message.text}
                      </Text>
                      <View style={styles.messageFooter}>
                        <Text style={[styles.messageTime, styles.userMessageTime]}>
                          {message.time}
                        </Text>
                        <Text style={styles.readStatus}>{message.isRead ? '✓✓' : '✓'}</Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.messageBubble, styles.supportMessage]}>
                      <Text style={[styles.messageText, styles.supportMessageText]}>
                        {message.text}
                      </Text>
                      <Text style={[styles.messageTime, styles.supportMessageTime]}>
                        {message.time}
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              {/* Индикатор печати админа */}
              {isTyping && (
                <View style={[styles.messageWrapper, styles.supportMessageWrapper]}>
                  <View style={styles.messageAvatarContainer}>
                    <View style={styles.messageAvatar}>
                      <Image
                        source={require('../../../assets/logo.jpg')}
                        style={styles.messageLogoImage}
                      />
                    </View>
                  </View>
                  <View style={[styles.messageBubble, styles.supportMessage, styles.typingBubble]}>
                    <Text style={styles.typingText}>Admin is typing...</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
            <Paperclip size={22} color="#64748B" strokeWidth={2} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder={t.main.chat.message}
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={sendMessage}
            activeOpacity={0.7}
            disabled={!inputText.trim() || sendMessageMutation.isPending}>
            <LinearGradient
              colors={inputText.trim() ? ['#0EA5E9', '#0284C7'] : ['#E2E8F0', '#E2E8F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}>
              <Send size={20} color={inputText.trim() ? '#FFFFFF' : '#94A3B8'} strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  airplanesBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  airplaneContainer: {
    position: 'absolute',
  },
  messagesContainer: {
    flex: 1,
    zIndex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 10,
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  supportMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatarContainer: {
    marginRight: 8,
    marginBottom: 2,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    overflow: 'hidden',
  },
  messageLogoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    borderBottomRightRadius: 6,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  supportMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  supportMessageText: {
    color: '#1E293B',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  supportMessageTime: {
    color: '#94A3B8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: '#1E293B',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonActive: {
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  readStatus: {
    fontSize: 12,
    color: '#E0F2FE',
    fontWeight: '600',
  },
  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  typingText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
});
