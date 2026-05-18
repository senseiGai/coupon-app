import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, Plane, MapPin, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/navigation/MainStack';
import { useLanguage } from '@/shared/lib/hooks';
import { TWA_REWARDS_CATALOG, type TwaRewardItem } from '@/shared/constants/twaRewardsCatalog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING = 16;
const GAP = 16;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GAP) / 2;

type Props = {
  balance: number;
  showTitle?: boolean;
};

const CARD_GRADIENT_GREY = ['#94A3B8', '#64748B'] as const;
const CARD_GRADIENT_GOLD = ['#FCD34D', '#F59E0B'] as const;

function formatTwaPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} TWA`;
}

export const TwaRewardsGrid: React.FC<Props> = ({ balance, showTitle = true }) => {
  const { t } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleApply = (item: TwaRewardItem) => {
    if (balance < item.price) {
      Alert.alert(
        t.bonusShop.notEnoughBonuses,
        t.bonusShop.needMore.replace('{amount}', String(item.price - balance)),
      );
      return;
    }

    Alert.alert(t.bonusShop.applyRewardTitle, t.bonusShop.applyRewardMessage, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.bonusShop.applyRewardButton,
        onPress: () => {
          navigation.navigate('MainTabs', {
            screen: 'Chat',
            params: { draftMessage: item.chatMessage },
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.section}>
      {showTitle ? (
        <Text style={styles.sectionTitle}>{t.bonusShop.availableRewards}</Text>
      ) : null}
      <View style={styles.grid}>
        {TWA_REWARDS_CATALOG.map((item) => {
          const canAfford = balance >= item.price;
          const colors = canAfford ? CARD_GRADIENT_GOLD : CARD_GRADIENT_GREY;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleApply(item)}>
              <LinearGradient
                colors={[...colors]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}>
                <View style={styles.topBadgesRow}>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>{formatTwaPrice(item.price)}</Text>
                  </View>
                  {!canAfford ? (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{t.bonusShop.notEnough}</Text>
                    </View>
                  ) : (
                    <View style={styles.statusBadgePlaceholder} />
                  )}
                </View>

                <View style={styles.iconContainer}>
                  <Gift size={28} color="#FFFFFF" strokeWidth={2} />
                </View>

                <View style={styles.itemContent}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemDescription} numberOfLines={3}>
                    {item.description}
                  </Text>

                  {(item.location || item.duration) && (
                    <View style={styles.metaContainer}>
                      {item.location ? (
                        <View style={styles.metaRow}>
                          <MapPin size={11} color="rgba(255,255,255,0.85)" />
                          <Text style={styles.metaText} numberOfLines={1}>
                            {item.location}
                          </Text>
                        </View>
                      ) : null}
                      {item.duration ? (
                        <View style={styles.metaRow}>
                          <Clock size={11} color="rgba(255,255,255,0.85)" />
                          <Text style={styles.metaText}>{item.duration}</Text>
                        </View>
                      ) : null}
                    </View>
                  )}
                </View>

                <View style={styles.priceContainer}>
                  <Plane size={14} color="#FFD700" />
                  <Text style={styles.priceText}>{formatTwaPrice(item.price)}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  card: {
    width: CARD_WIDTH,
  },
  gradient: {
    borderRadius: 16,
    padding: 12,
    minHeight: 240,
  },
  topBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    minHeight: 22,
  },
  priceBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: '52%',
  },
  statusBadgePlaceholder: {
    width: 1,
    height: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 14,
    marginBottom: 6,
  },
  metaContainer: {
    marginTop: 4,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
