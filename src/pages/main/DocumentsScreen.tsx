import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, Eye } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Моковые документы - в реальном приложении будут загружаться
const mockDocuments = [
  { id: '1', date: '15.01.2025' },
  { id: '2', date: '12.01.2025' },
  { id: '3', date: '10.01.2025' },
];

export const DocumentsScreen = () => {
  const handleViewDocument = (date: string) => {
    Alert.alert('📄', `Документ от ${date}`, [{ text: 'Закрыть' }]);
  };

  const handleDownloadDocument = (date: string) => {
    Alert.alert('⬇️', `Загрузка документа от ${date}...`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Загрузить', onPress: () => Alert.alert('✅', 'Документ загружен!') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {mockDocuments.length > 0 ? (
          <View style={styles.documentsList}>
            {mockDocuments.map((doc, index) => (
              <TouchableOpacity
                key={doc.id}
                activeOpacity={0.8}
                onPress={() => handleViewDocument(doc.date)}>
                <LinearGradient
                  colors={
                    index % 3 === 0
                      ? ['#06B6D4', '#0EA5E9']
                      : index % 3 === 1
                        ? ['#8B5CF6', '#7C3AED']
                        : ['#10B981', '#059669']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.documentCard}>
                  <View style={styles.documentIconContainer}>
                    <FileText size={60} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentDate}>{doc.date}</Text>
                  </View>
                  <View style={styles.documentActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleViewDocument(doc.date);
                      }}>
                      <Eye size={20} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDownloadDocument(doc.date);
                      }}>
                      <Download size={20} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FileText size={48} color="#94A3B8" strokeWidth={1.5} />
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingTop: 48,
  },
  documentsList: {
    paddingHorizontal: 20,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 12,
    overflow: 'hidden',
  },
  documentIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  documentInfo: {
    flex: 1,
  },
  documentDate: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
});
