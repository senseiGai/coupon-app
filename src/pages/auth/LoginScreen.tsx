import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../app/navigation/AuthStack';
import { Input } from '../../shared/ui/Input/Input';
import { Button } from '../../shared/ui/Button/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email обязателен';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!password) {
      newErrors.password = 'Пароль обязателен';
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Здесь будет логика входа
      console.log('Вход:', { email, password });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>Вход</Text>
          <Text style={styles.subtitle}>Войдите в свой аккаунт</Text>
        </View>

        {/* Форма */}
        <View style={styles.formContainer}>
          <Input
            label="Email"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Пароль"
            placeholder="Введите пароль"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
          </TouchableOpacity>

          <Button title="Войти" onPress={handleLogin} />
        </View>

        {/* Нижняя секция */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerText}>
              Нет аккаунта? <Text style={styles.footerLink}>Зарегистрироваться</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0EA5E9',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: '#0EA5E9',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#64748B',
  },
  footerLink: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
});
