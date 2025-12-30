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
import { useLanguage, useLogin } from '../../shared/lib/hooks';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { t, language, setLanguage } = useLanguage();
  const loginMutation = useLogin();
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

  const handleLogin = async () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = t.auth.login.errors.emailRequired;
    } else if (!validateEmail(email)) {
      newErrors.email = t.auth.login.errors.emailInvalid;
    }

    if (!password) {
      newErrors.password = t.auth.login.errors.passwordRequired;
    } else if (password.length < 6) {
      newErrors.password = t.auth.login.errors.passwordMinLength;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        console.log('[LoginScreen] Logging in with:', { email, password });
        const result = await loginMutation.mutateAsync({ email, password });
        console.log('[LoginScreen] Login successful:', result);
        // RootNavigator автоматически переведет на MainStack когда увидит токен
      } catch (error: any) {
        console.error('[LoginScreen] Login error:', error);
        Alert.alert(t.common.error, error.message || 'Login failed. Please try again.');
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
            <Text style={styles.title}>{t.auth.login.title}</Text>
            <Text style={styles.subtitle}>{t.auth.login.subtitle}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Input
            label={t.auth.login.email}
            placeholder={t.auth.login.emailPlaceholder}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label={t.auth.login.password}
            placeholder={t.auth.login.passwordPlaceholder}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          {/* <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>{t.auth.login.forgotPassword}</Text>
          </TouchableOpacity> */}

          {loginMutation.isPending ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : (
            <Button title={t.auth.login.signIn} onPress={handleLogin} />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerText}>
              {t.auth.login.noAccount} <Text style={styles.footerLink}>{t.auth.login.signUp}</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: '#0EA5E9',
    fontSize: 14,
    fontWeight: '600',
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
