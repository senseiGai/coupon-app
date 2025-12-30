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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Paperclip, Plane } from 'lucide-react-native';
import { useState, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../shared/lib/hooks';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Генерируем позиции для самолётиков по сетке (чтобы не накладывались)
const generateAirplanes = () => {
  const airplanes = [];
  const cols = 4; // Колонки
  const rows = 6; // Ряды
  const cellWidth = SCREEN_WIDTH / cols;
  const cellHeight = (SCREEN_HEIGHT - 200) / rows;

  let id = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Небольшое случайное смещение внутри ячейки
      const offsetX = (Math.random() - 0.5) * (cellWidth * 0.4);
      const offsetY = (Math.random() - 0.5) * (cellHeight * 0.4);

      airplanes.push({
        id: id++,
        x: col * cellWidth + cellWidth / 2 + offsetX - 12,
        y: row * cellHeight + cellHeight / 2 + offsetY,
        rotation: Math.random() * 360,
        scale: 1,
        opacity: 0.12 + Math.random() * 0.06,
      });
    }
  }
  return airplanes;
};

const airplanes = generateAirplanes();

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  time: string;
}

export const ChatScreen = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋\nWelcome to support service. How can I help you?',
      isUser: false,
      time: '10:00',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isUser: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setInputText('');

      // Автоматический скролл вниз
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

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
        <View style={styles.airplanesBackground}>
          {airplanes.map((airplane) => (
            <View
              key={airplane.id}
              style={[
                styles.airplaneContainer,
                {
                  left: airplane.x,
                  top: airplane.y,
                  transform: [{ rotate: `${airplane.rotation}deg` }, { scale: airplane.scale }],
                  opacity: airplane.opacity,
                },
              ]}>
              <Plane size={24} color="#0EA5E9" strokeWidth={1.5} />
            </View>
          ))}
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}>
          {/* Date */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{t.common.today || 'Today'}</Text>
          </View>

          {messages.map((message) => (
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
                  <Text style={[styles.messageText, styles.userMessageText]}>{message.text}</Text>
                  <Text style={[styles.messageTime, styles.userMessageTime]}>{message.time}</Text>
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
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
            <Paperclip size={22} color="#64748B" strokeWidth={2} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t.main.chat.message}
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={sendMessage}
            activeOpacity={0.7}
            disabled={!inputText.trim()}>
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
});
