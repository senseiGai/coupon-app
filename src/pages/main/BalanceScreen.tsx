import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, TrendingUp, ShoppingCart, ChevronRight } from 'lucide-react-native';

const balanceHistory = [
  { id: '1', type: 'earn', amount: 50, description: 'Просмотр рекламы', date: 'Сегодня, 14:30' },
  { id: '2', type: 'earn', amount: 50, description: 'Просмотр рекламы', date: 'Сегодня, 12:15' },
  { id: '3', type: 'spend', amount: -500, description: 'Скидка на тур', date: 'Вчера, 18:00' },
  {
    id: '4',
    type: 'earn',
    amount: 100,
    description: 'Бонус за регистрацию',
    date: '10 дек, 10:00',
  },
  { id: '5', type: 'earn', amount: 50, description: 'Просмотр рекламы', date: '9 дек, 16:45' },
];

export const BalanceScreen = () => {
  const balance = 2450;
  const adsWatchedToday = 3;
  const maxAdsPerDay = 10;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Баланс</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Текущий баланс</Text>
          <Text style={styles.balanceAmount}>{balance.toLocaleString()} ₽</Text>
          <View style={styles.balanceProgress}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>До следующего тура</Text>
              <Text style={styles.progressValue}>15 000 ₽</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(balance / 15000) * 100}%` }]} />
            </View>
            <Text style={styles.progressHint}>Осталось {(15000 - balance).toLocaleString()} ₽</Text>
          </View>
        </View>

        {/* Watch Ad Button */}
        <View style={styles.adSection}>
          <TouchableOpacity style={styles.watchAdButton} activeOpacity={0.8}>
            <View style={styles.watchAdIconContainer}>
              <Play size={24} color="#0EA5E9" strokeWidth={2} fill="#0EA5E9" />
            </View>
            <View style={styles.watchAdContent}>
              <Text style={styles.watchAdTitle}>Смотреть рекламу</Text>
              <Text style={styles.watchAdSubtitle}>+50 ₽ за просмотр</Text>
            </View>
            <View style={styles.watchAdArrow}>
              <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          <View style={styles.adLimitInfo}>
            <Text style={styles.adLimitText}>
              Сегодня: {adsWatchedToday}/{maxAdsPerDay} просмотров
            </Text>
            <View style={styles.adLimitBar}>
              <View
                style={[
                  styles.adLimitFill,
                  { width: `${(adsWatchedToday / maxAdsPerDay) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1 250 ₽</Text>
            <Text style={styles.statLabel}>Заработано за месяц</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>47</Text>
            <Text style={styles.statLabel}>Реклам просмотрено</Text>
          </View>
        </View>

        {/* History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>История</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Вся история</Text>
            </TouchableOpacity>
          </View>

          {balanceHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View
                style={[
                  styles.historyIcon,
                  { backgroundColor: item.type === 'earn' ? '#DCFCE7' : '#FEE2E2' },
                ]}>
                {item.type === 'earn' ? (
                  <TrendingUp size={20} color="#16A34A" strokeWidth={2} />
                ) : (
                  <ShoppingCart size={20} color="#DC2626" strokeWidth={2} />
                )}
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyDescription}>{item.description}</Text>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
              <Text
                style={[
                  styles.historyAmount,
                  { color: item.type === 'earn' ? '#16A34A' : '#DC2626' },
                ]}>
                {item.type === 'earn' ? '+' : ''}
                {item.amount} ₽
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  balanceCard: {
    marginHorizontal: 20,
    backgroundColor: '#0EA5E9',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  balanceProgress: {},
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  adSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  watchAdButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  watchAdIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  watchAdContent: {
    flex: 1,
  },
  watchAdTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  watchAdSubtitle: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  watchAdArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  adLimitInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
  },
  adLimitText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  adLimitBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  adLimitFill: {
    height: 4,
    backgroundColor: '#0EA5E9',
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionLink: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  historyInfo: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 3,
  },
  historyDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
