import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Hotel,
  Plane,
  Bus,
  Palmtree,
  FileText,
  Gift,
  MessageCircle,
  Plus,
} from 'lucide-react-native';

// Моковые данные
const mockDocuments = [
  {
    id: '1',
    type: 'voucher',
    title: 'Отель Sunrise Resort',
    subtitle: 'Турция, Анталья',
    date: '15 янв - 22 янв 2025',
    status: 'active',
  },
  {
    id: '2',
    type: 'boarding',
    title: 'Посадочный талон',
    subtitle: 'SU-1234 • Москва → Анталья',
    date: '15 янв, 08:30',
    status: 'upcoming',
  },
  {
    id: '3',
    type: 'transfer',
    title: 'Трансфер из аэропорта',
    subtitle: 'Аэропорт → Sunrise Resort',
    date: '15 янв, 14:00',
    status: 'upcoming',
  },
];

const DocumentIcon = ({ type }: { type: string }) => {
  const iconProps = { size: 22, strokeWidth: 2 };
  switch (type) {
    case 'voucher':
      return <Hotel {...iconProps} color="#0EA5E9" />;
    case 'boarding':
      return <Plane {...iconProps} color="#8B5CF6" />;
    case 'transfer':
      return <Bus {...iconProps} color="#F59E0B" />;
    default:
      return <FileText {...iconProps} color="#64748B" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return '#10B981';
    case 'upcoming':
      return '#0EA5E9';
    case 'expired':
      return '#94A3B8';
    default:
      return '#64748B';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Активен';
    case 'upcoming':
      return 'Скоро';
    case 'expired':
      return 'Истек';
    default:
      return status;
  }
};

export const HomePage = () => {
  const balance = 2450;
  const userName = 'Гайдар';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Привет, {userName} 👋</Text>
            <Text style={styles.subGreeting}>Ваши путешествия</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileButtonText}>ГТ</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <TouchableOpacity style={styles.balanceCard} activeOpacity={0.9}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Ваш баланс</Text>
            <View style={styles.balanceBadge}>
              <Text style={styles.balanceBadgeText}>+ Смотреть рекламу</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>{balance.toLocaleString()} ₽</Text>
          <Text style={styles.balanceHint}>Копите баллы и получайте туры бесплатно</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Palmtree size={24} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.quickActionText}>Туры</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
              <FileText size={24} color="#10B981" strokeWidth={2} />
            </View>
            <Text style={styles.quickActionText}>Документы</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Gift size={24} color="#F59E0B" strokeWidth={2} />
            </View>
            <Text style={styles.quickActionText}>Бонусы</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FCE7F3' }]}>
              <MessageCircle size={24} color="#EC4899" strokeWidth={2} />
            </View>
            <Text style={styles.quickActionText}>Поддержка</Text>
          </TouchableOpacity>
        </View>

        {/* Documents Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Мои документы</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Все</Text>
            </TouchableOpacity>
          </View>

          {mockDocuments.map((doc) => (
            <TouchableOpacity key={doc.id} style={styles.documentCard} activeOpacity={0.7}>
              <View style={styles.documentIconContainer}>
                <DocumentIcon type={doc.type} />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{doc.title}</Text>
                <Text style={styles.documentSubtitle}>{doc.subtitle}</Text>
                <Text style={styles.documentDate}>{doc.date}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(doc.status) + '20' },
                ]}>
                <Text style={[styles.statusText, { color: getStatusColor(doc.status) }]}>
                  {getStatusText(doc.status)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo Banner */}
        <TouchableOpacity style={styles.promoBanner} activeOpacity={0.9}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Турция от 15 000 баллов! 🇹🇷</Text>
            <Text style={styles.promoSubtitle}>Смотрите рекламу и копите на путешествие мечты</Text>
          </View>
          <Text style={styles.promoArrow}>→</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 15,
    color: '#64748B',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  balanceCard: {
    marginHorizontal: 20,
    backgroundColor: '#0EA5E9',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  balanceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  balanceBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 28,
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 3,
  },
  documentSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  promoBanner: {
    marginHorizontal: 20,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: '#B45309',
  },
  promoArrow: {
    fontSize: 24,
    color: '#92400E',
    marginLeft: 12,
  },
});
