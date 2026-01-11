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
<<<<<<< HEAD
import { AirplaneBackground } from '../../shared/ui/AirplaneBackground';
=======
import { wp, hp, fontSize, responsive } from '../../shared/lib/responsive';
>>>>>>> 2e63c83 (Refactor styles for responsive design across multiple screens)

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
        Alert.alert(t.common.error, error.message || t.common.registrationFailed);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <AirplaneBackground />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t.auth.register.title}</Text>
            <Text style={styles.subtitle}>{t.auth.register.subtitle}</Text>
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
    paddingHorizontal: wp(20),
    paddingVertical: hp(40),
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: hp(40),
    alignItems: 'center',
  },
  title: {
    fontSize: responsive({ xs: fontSize(30), sm: fontSize(34), default: fontSize(36) }),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp(12),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize(16),
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  languageButton: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    borderRadius: wp(8),
    backgroundColor: '#E0F2FE',
  },
  languageText: {
    fontSize: fontSize(12),
    fontWeight: '600',
    color: '#0EA5E9',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(24),
    padding: wp(28),
    marginBottom: hp(28),
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  loadingButton: {
    height: hp(56),
    borderRadius: wp(12),
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: hp(8),
  },
  footerText: {
    fontSize: fontSize(15),
    color: '#64748B',
    textAlign: 'center',
  },
  footerLink: {
    color: '#0EA5E9',
    fontWeight: '700',
  },
});
