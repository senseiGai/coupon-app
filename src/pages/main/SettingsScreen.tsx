import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Trash2, ChevronLeft } from 'lucide-react-native';
import { useLanguage, useLogout, useDeleteAccount } from '../../shared/lib/hooks';
import { useNavigation } from '@react-navigation/native';
import { AirplaneBackground } from '../../shared/ui/AirplaneBackground';
import { wp, hp, fontSize, sizes } from '../../shared/lib/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
  },
  backButton: {
    padding: wp(4),
  },
  headerTitle: {
    fontSize: fontSize(20),
    fontWeight: '700',
    color: '#1E293B',
  },
  content: {
    paddingHorizontal: wp(16),
    paddingTop: hp(24),
    gap: hp(12),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: hp(14),
    borderRadius: wp(16),
    gap: wp(10),
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  logoutButtonText: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: '#0EA5E9',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: hp(14),
    borderRadius: wp(16),
    gap: wp(10),
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: '#EF4444',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const SettingsScreen = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const logoutMutation = useLogout();
  const deleteAccountMutation = useDeleteAccount();

  const handleLogout = () => {
    Alert.alert(t.common.logout, t.common.logoutConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.logout,
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutMutation.mutateAsync();
          } catch {
            Alert.alert(t.common.error, t.common.logoutFailed);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(t.common.deleteAccount, t.common.deleteAccountConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          // Двойное подтверждение
          Alert.alert(
            t.common.deleteAccount,
            t.common.deleteAccountConfirm,
            [
              { text: t.common.cancel, style: 'cancel' },
              {
                text: t.common.delete,
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteAccountMutation.mutateAsync();
                    Alert.alert(t.common.success, t.common.deleteAccountSuccess);
                  } catch {
                    Alert.alert(t.common.error, t.common.deleteAccountFailed);
                  }
                },
              },
            ],
          );
        },
      },
    ]);
  };

  const isLoading = logoutMutation.isPending || deleteAccountMutation.isPending;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AirplaneBackground />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={wp(28)} color="#1E293B" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.common.settings}</Text>
        <View style={{ width: wp(28) }} />
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      )}

      <View style={styles.content}>
        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={styles.logoutButton}
          disabled={isLoading}>
          <LogOut size={sizes.iconSM} color="#0EA5E9" strokeWidth={2.5} />
          <Text style={styles.logoutButtonText}>{t.common.logout}</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDeleteAccount}
          style={styles.deleteButton}
          disabled={isLoading}>
          <Trash2 size={sizes.iconSM} color="#EF4444" strokeWidth={2.5} />
          <Text style={styles.deleteButtonText}>{t.common.deleteAccount}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
