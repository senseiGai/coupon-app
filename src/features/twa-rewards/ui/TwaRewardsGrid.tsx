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
import { Plane, MapPin, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/navigation/MainStack';
import { useLanguage } from '@/shared/lib/hooks';
import { TWA_REWARDS_CATALOG, type TwaRewardItem } from '@/shared/constants/twaRewardsCatalog';
import { wp, hp, fontSize } from '@/shared/lib/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - wp(40) - wp(12)) / 2;

type Props = {
  balance: number;
};

const CARD_GRADIENT = ['#64748B', '#475569'] as const;
const CARD_GRADIENT_ACTIVE = ['#FCD34D', '#F59E0B'] as const;

function formatTwaPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} TWA`;
}

export const TwaRewardsGrid: React.FC<Props> = ({ balance }) => {
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

    Alert.alert(t.main.balance.applyRewardTitle, t.main.balance.applyRewardMessage, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.main.balance.applyRewardButton,
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
      <Text style={styles.sectionTitle}>{t.bonusShop.availableRewards}</Text>
      <View style={styles.grid}>
        {TWA_REWARDS_CATALOG.map((item) => {
          const canAfford = balance >= item.price;
          const colors = canAfford ? CARD_GRADIENT_ACTIVE : CARD_GRADIENT;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleApply(item)}>
              <LinearGradient colors={[...colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
                <View style={styles.topRow}>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>{formatTwaPrice(item.price)}</Text>
                  </View>
                  {!canAfford ? (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{t.bonusShop.notEnough}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.iconWrap}>
                  <Plane size={28} color="#FFFFFF" strokeWidth={2} />
                </View>

                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.description} numberOfLines={3}>
                  {item.description}
                </Text>

                <View style={styles.meta}>
                  {item.location ? (
                    <View style={styles.metaRow}>
                      <MapPin size={11} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  ) : null}
                  {item.duration ? (
                    <View style={styles.metaRow}>
                      <Clock size={11} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.metaText}>{item.duration}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.applyBtn}>
                  <Plane size={14} color="#FFD700" />
                  <Text style={styles.applyBtnText}>{t.main.balance.applyRewardButton}</Text>
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
    marginBottom: hp(20),
  },
  sectionTitle: {
    fontSize: fontSize(18),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: hp(12),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(12),
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: wp(16),
    overflow: 'hidden',
  },
  gradient: {
    padding: wp(12),
    minHeight: hp(220),
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: wp(4),
  },
  priceBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
    borderRadius: wp(8),
  },
  priceBadgeText: {
    fontSize: fontSize(12),
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    backgroundColor: 'rgba(15,23,42,0.75)',
    paddingHorizontal: wp(6),
    paddingVertical: hp(3),
    borderRadius: wp(6),
    maxWidth: '55%',
  },
  statusBadgeText: {
    fontSize: fontSize(9),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  iconWrap: {
    alignSelf: 'center',
    width: wp(52),
    height: wp(52),
    borderRadius: wp(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: hp(8),
  },
  title: {
    fontSize: fontSize(14),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: hp(4),
  },
  description: {
    fontSize: fontSize(11),
    color: 'rgba(255,255,255,0.92)',
    lineHeight: fontSize(15),
    marginBottom: hp(6),
  },
  meta: {
    gap: hp(4),
    marginBottom: hp(8),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  metaText: {
    flex: 1,
    fontSize: fontSize(10),
    color: 'rgba(255,255,255,0.88)',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(6),
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingVertical: hp(10),
    borderRadius: wp(12),
  },
  applyBtnText: {
    fontSize: fontSize(11),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
