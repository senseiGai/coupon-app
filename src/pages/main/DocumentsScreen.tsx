import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Hotel, Plane, Bus, FileText } from 'lucide-react-native';

const allDocuments = [
  {
    id: '1',
    type: 'voucher',
    title: 'Отель Sunrise Resort',
    subtitle: 'Турция, Анталья',
    details: 'All Inclusive • 2 взрослых',
    date: '15 янв - 22 янв 2025',
    status: 'active',
  },
  {
    id: '2',
    type: 'boarding',
    title: 'Посадочный талон',
    subtitle: 'SU-1234 • Москва → Анталья',
    details: 'Место: 12A • Бизнес класс',
    date: '15 янв, 08:30',
    status: 'upcoming',
  },
  {
    id: '3',
    type: 'boarding',
    title: 'Посадочный талон',
    subtitle: 'SU-1235 • Анталья → Москва',
    details: 'Место: 12A • Бизнес класс',
    date: '22 янв, 16:45',
    status: 'upcoming',
  },
  {
    id: '4',
    type: 'transfer',
    title: 'Трансфер из аэропорта',
    subtitle: 'Аэропорт → Sunrise Resort',
    details: 'Mercedes Viano • До 6 человек',
    date: '15 янв, 14:00',
    status: 'upcoming',
  },
  {
    id: '5',
    type: 'transfer',
    title: 'Трансфер в аэропорт',
    subtitle: 'Sunrise Resort → Аэропорт',
    details: 'Mercedes Viano • До 6 человек',
    date: '22 янв, 12:00',
    status: 'upcoming',
  },
  {
    id: '6',
    type: 'voucher',
    title: 'Rixos Premium',
    subtitle: 'Египет, Шарм-эль-Шейх',
    details: 'Ultra All Inclusive • 2 взрослых',
    date: '10 дек - 17 дек 2024',
    status: 'expired',
  },
];

const DocumentIcon = ({ type, expired }: { type: string; expired?: boolean }) => {
  const iconProps = { size: 24, strokeWidth: 2 };
  const opacity = expired ? 0.5 : 1;
  switch (type) {
    case 'voucher':
      return <Hotel {...iconProps} color="#0EA5E9" style={{ opacity }} />;
    case 'boarding':
      return <Plane {...iconProps} color="#8B5CF6" style={{ opacity }} />;
    case 'transfer':
      return <Bus {...iconProps} color="#F59E0B" style={{ opacity }} />;
    default:
      return <FileText {...iconProps} color="#64748B" style={{ opacity }} />;
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
      return 'Завершен';
    default:
      return status;
  }
};

const tabs = ['Все', 'Ваучеры', 'Талоны', 'Трансферы'];

export const DocumentsScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Документы</Text>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabChip, index === 0 && styles.tabChipActive]}>
              <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Documents */}
        <View style={styles.documentsList}>
          {allDocuments.map((doc) => (
            <TouchableOpacity key={doc.id} style={styles.documentCard} activeOpacity={0.7}>
              <View style={styles.documentIconContainer}>
                <DocumentIcon type={doc.type} expired={doc.status === 'expired'} />
              </View>
              <View style={styles.documentInfo}>
                <View style={styles.documentHeader}>
                  <Text
                    style={[styles.documentTitle, doc.status === 'expired' && styles.expiredText]}>
                    {doc.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(doc.status) + '20' },
                    ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(doc.status) }]}>
                      {getStatusText(doc.status)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.documentSubtitle, doc.status === 'expired' && styles.expiredText]}>
                  {doc.subtitle}
                </Text>
                <Text style={styles.documentDetails}>{doc.details}</Text>
                <Text style={styles.documentDate}>{doc.date}</Text>
              </View>
            </TouchableOpacity>
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tabChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  tabChipActive: {
    backgroundColor: '#0EA5E9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  documentsList: {
    paddingHorizontal: 20,
  },
  documentCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  documentIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  documentInfo: {
    flex: 1,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  documentSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  documentDetails: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 13,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  expiredText: {
    color: '#94A3B8',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
