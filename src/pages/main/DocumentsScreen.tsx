import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLanguage, useDocuments } from '../../shared/lib/hooks';
import type { Document as ApiDocument } from '../../shared/types/document';
import { AirplaneBackground } from '../../shared/ui/AirplaneBackground';
import { wp, hp, fontSize, responsive } from '../../shared/lib/responsive';
import { useCallback } from 'react';

export const DocumentsScreen = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Загружаем документы из API
  const { data: documents = [], isLoading, error, refetch } = useDocuments();

  // Refetch при каждом открытии страницы
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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
      const downloadMessage = t.main.documents.downloading.replace('{filename}', doc.originalName);

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

      if (__DEV__) console.log('File downloaded to:', file.uri);

      // Проверяем доступность Sharing API
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Открываем системное меню "Поделиться" для сохранения файла
        await Sharing.shareAsync(file.uri, {
          mimeType: doc.mimetype,
          dialogTitle: t.main.documents.saveDocument,
        });
      } else {
      }
    } catch (error) {
      if (__DEV__) console.error('Download error:', error);
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
          <Search size={wp(20)} color="#94A3B8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.main.documents.searchPlaceholder}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0EA5E9']}
            tintColor="#0EA5E9"
          />
        }>
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
                      <FileText size={wp(40)} color="#FFFFFF" strokeWidth={2} />
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
                      <Download size={wp(22)} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FileText size={wp(64)} color="#CBD5E1" strokeWidth={1.5} />
            <Text style={styles.emptyText}>{t.main.documents.noDocuments}</Text>
            <Text style={styles.emptySubtext}>{t.main.documents.noDocumentsHint}</Text>
          </View>
        )}
        <View style={{ height: hp(100) }} />
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
    paddingHorizontal: wp(20),
    paddingTop: hp(12),
    paddingBottom: hp(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: fontSize(28),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp(4),
  },
  headerSubtitle: {
    fontSize: fontSize(14),
    color: '#64748B',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
    backgroundColor: '#FFFFFF',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: wp(16),
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
    gap: wp(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize(15),
    color: '#1E293B',
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: hp(16),
  },
  documentsList: {
    paddingHorizontal: wp(16),
  },
  documentCardWrapper: {
    marginBottom: hp(12),
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp(24),
    padding: wp(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  documentIconContainer: {
    width: wp(64),
    height: wp(64),
    borderRadius: wp(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(14),
    flexShrink: 0,
  },
  documentInfo: {
    flex: 1,
    gap: hp(4),
    marginRight: wp(8),
  },
  documentTitle: {
    fontSize: fontSize(16),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: hp(2),
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  documentType: {
    fontSize: fontSize(12),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: '50%',
  },
  documentDate: {
    fontSize: fontSize(12),
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  documentSize: {
    fontSize: fontSize(12),
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: hp(2),
  },
  metaDivider: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: wp(6),
  },
  actionButton: {
    width: wp(52),
    height: wp(52),
    borderRadius: wp(18),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(120),
    gap: hp(12),
  },
  emptyText: {
    fontSize: fontSize(20),
    fontWeight: '700',
    color: '#64748B',
    marginTop: hp(16),
  },
  emptySubtext: {
    fontSize: fontSize(14),
    fontWeight: '500',
    color: '#94A3B8',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(120),
    gap: hp(16),
  },
  loadingText: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: '#64748B',
  },
});
