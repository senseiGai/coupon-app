import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLanguage, useDocuments } from '../../shared/lib/hooks';
import type { Document as ApiDocument } from '../../shared/types/document';
import { AirplaneBackground } from '../../shared/ui/AirplaneBackground';

export const DocumentsScreen = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Загружаем документы из API
  const { data: documents = [], isLoading, error } = useDocuments();

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.mimetype.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDocument = async (doc: ApiDocument) => {
    try {
      // Открываем файл в браузере/встроенном просмотрщике
      const canOpen = await Linking.canOpenURL(doc.url);
      if (canOpen) {
        await Linking.openURL(doc.url);
      } else {
      }
    } catch (error) {}
  };

  const handleDownloadDocument = async (doc: ApiDocument) => {
    try {
      const downloadMessage =
        language === 'en'
          ? `Downloading ${doc.originalName}...`
          : `Скачивание ${doc.originalName}...`;

      // Создаем файл в кэше
      const file = new File(Paths.cache, doc.originalName);

      // Скачиваем файл через XMLHttpRequest (работает в RN)
      const downloadedData = await new Promise<Uint8Array>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', doc.url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = () => {
          if (xhr.status === 200) {
            const arrayBuffer = xhr.response as ArrayBuffer;
            resolve(new Uint8Array(arrayBuffer));
          } else {
            reject(new Error(`HTTP error! status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send();
      });

      // Записываем в файл
      await file.write(downloadedData);

      console.log('File downloaded to:', file.uri);

      // Проверяем доступность Sharing API
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Открываем системное меню "Поделиться" для сохранения файла
        await Sharing.shareAsync(file.uri, {
          mimeType: doc.mimetype,
          dialogTitle: language === 'en' ? 'Save document' : 'Сохранить документ',
        });
      } else {
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AirplaneBackground />
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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text style={styles.loadingText}>{t.common.loading}</Text>
          </View>
        ) : filteredDocuments.length > 0 ? (
          <View style={styles.documentsList}>
            {filteredDocuments.map((doc, index) => {
              const fileSize = (doc.size / 1024 / 1024).toFixed(2);
              const date = new Date(doc.createdAt).toLocaleDateString();

              return (
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
                      <Text style={styles.documentTitle} numberOfLines={1}>
                        {doc.originalName}
                      </Text>
                      <View style={styles.documentMeta}>
                        <Text style={styles.documentType} numberOfLines={1}>
                          {doc.mimetype}
                        </Text>
                        <View style={styles.metaDivider} />
                        <Text style={styles.documentDate}>{date}</Text>
                      </View>
                      <Text style={styles.documentSize}>{fileSize} MB</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDownloadDocument(doc);
                      }}>
                      <Download size={22} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
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
    flexShrink: 0,
  },
  documentInfo: {
    flex: 1,
    gap: 4,
    marginRight: 8,
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
    flexWrap: 'wrap',
  },
  documentType: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: '50%',
  },
  documentDate: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  documentSize: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 6,
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});
