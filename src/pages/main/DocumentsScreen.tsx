import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, Eye, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useLanguage } from '../../shared/lib/hooks';

interface Document {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
}

// Моковые документы - в реальном приложении будут загружаться
const mockDocuments: Document[] = [
  { id: '1', title: 'Tour Agreement', type: 'Contract', date: '15.01.2025', size: '2.4 MB' },
  { id: '2', title: 'Payment Receipt', type: 'Invoice', date: '12.01.2025', size: '1.2 MB' },
  { id: '3', title: 'Travel Insurance', type: 'Insurance', date: '10.01.2025', size: '890 KB' },
];

export const DocumentsScreen = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = mockDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDocument = (doc: Document) => {
    Alert.alert('📄', `${doc.title}\n${doc.type} • ${doc.date}`, [{ text: t.common.cancel }]);
  };

  const handleDownloadDocument = (doc: Document) => {
    Alert.alert('⬇️', `Downloading ${doc.title}...`, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.main.documents.upload, onPress: () => Alert.alert('✅', 'Document downloaded!') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.main.documents.title}</Text>
        <Text style={styles.headerSubtitle}>
          {filteredDocuments.length} {t.main.documents.documents}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#94A3B8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.main.documents.searchPlaceholder}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredDocuments.length > 0 ? (
          <View style={styles.documentsList}>
            {filteredDocuments.map((doc, index) => (
              <TouchableOpacity
                key={doc.id}
                activeOpacity={0.95}
                onPress={() => handleViewDocument(doc)}
                style={styles.documentCardWrapper}>
                <LinearGradient
                  colors={
                    index % 3 === 0
                      ? ['#38BDF8', '#0EA5E9']
                      : index % 3 === 1
                        ? ['#A78BFA', '#8B5CF6']
                        : ['#34D399', '#10B981']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.documentCard}>
                  <View style={styles.documentIconContainer}>
                    <FileText size={40} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentTitle}>{doc.title}</Text>
                    <View style={styles.documentMeta}>
                      <Text style={styles.documentType}>{doc.type}</Text>
                      <View style={styles.metaDivider} />
                      <Text style={styles.documentDate}>{doc.date}</Text>
                    </View>
                    <Text style={styles.documentSize}>{doc.size}</Text>
                  </View>
                  <View style={styles.documentActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleViewDocument(doc);
                      }}>
                      <Eye size={20} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDownloadDocument(doc);
                      }}>
                      <Download size={20} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FileText size={64} color="#CBD5E1" strokeWidth={1.5} />
            <Text style={styles.emptyText}>{t.main.documents.noDocuments}</Text>
            <Text style={styles.emptySubtext}>{t.main.documents.noDocumentsHint}</Text>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: 16,
  },
  documentsList: {
    paddingHorizontal: 16,
  },
  documentCardWrapper: {
    marginBottom: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  documentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  documentInfo: {
    flex: 1,
    gap: 4,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentType: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 8,
  },
  documentDate: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  documentSize: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
});
