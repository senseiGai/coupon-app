import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../app/navigation/AuthStack';
import { Input } from '../../shared/ui/Input/Input';
import { Button } from '../../shared/ui/Button/Button';
import { useLanguage, useRegister } from '../../shared/lib/hooks';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { t, language, setLanguage } = useLanguage();
  const registerMutation = useRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = t.auth.register.errors.emailRequired;
    } else if (!validateEmail(email)) {
      newErrors.email = t.auth.register.errors.emailInvalid;
    }

    if (!password) {
      newErrors.password = t.auth.register.errors.passwordRequired;
    } else if (password.length < 6) {
      newErrors.password = t.auth.register.errors.passwordMinLength;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t.auth.register.errors.confirmPasswordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t.auth.register.errors.passwordMismatch;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        console.log('[RegisterScreen] Submitting registration with:', { email, password });
        const result = await registerMutation.mutateAsync({
          email,
          password,
        });
        console.log('[RegisterScreen] Registration successful:', result);
        Alert.alert(t.common.success, t.auth.register.successMessage, [
          {
            text: 'OK',
            onPress: () => {
              // Очищаем поля и переходим на LoginScreen
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setErrors({});
              navigation.replace('Login');
            },
          },
        ]);
      } catch (error: any) {
        console.error('[RegisterScreen] Registration error:', error);
        Alert.alert(t.common.error, error.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t.auth.register.title}</Text>
            <Text style={styles.subtitle}>{t.auth.register.subtitle}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Input
            label={t.auth.register.email}
            placeholder={t.auth.register.emailPlaceholder}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label={t.auth.register.password}
            placeholder={t.auth.register.passwordPlaceholder}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          <Input
            label={t.auth.register.confirmPassword}
            placeholder={t.auth.register.confirmPasswordPlaceholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          {registerMutation.isPending ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : (
            <Button title={t.auth.register.signUp} onPress={handleRegister} />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
              {t.auth.register.haveAccount}{' '}
              <Text style={styles.footerLink}>{t.auth.register.signIn}</Text>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  loadingButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
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
    fontWeight: '700',
  },
});
