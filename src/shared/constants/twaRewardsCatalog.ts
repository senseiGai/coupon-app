import type { Language } from '@/shared/config/i18n';

type LocalizedRewardText = {
  title: string;
  description: string;
  location?: string;
  duration?: string;
  chatMessage: string;
};

export type TwaRewardCatalogEntry = {
  id: string;
  price: number;
  isSurprise?: boolean;
  ru: LocalizedRewardText;
  en: LocalizedRewardText;
  uk: LocalizedRewardText;
};

export type TwaRewardItem = {
  id: string;
  price: number;
  isSurprise?: boolean;
  title: string;
  description: string;
  location?: string;
  duration?: string;
  chatMessage: string;
};

export const TWA_REWARDS_CATALOG: TwaRewardCatalogEntry[] = [
  {
    id: 'tour-discount-1',
    price: 10,
    isSurprise: true,
    ru: {
      title: '',
      description: '',
      chatMessage: 'Здравствуйте! Хочу применить бонус 10 TWA — бонус-сюрприз 🎁',
    },
    en: {
      title: '',
      description: '',
      chatMessage: 'Hello! I would like to apply a 10 TWA bonus — surprise bonus 🎁',
    },
    uk: {
      title: '',
      description: '',
      chatMessage: 'Вітаю! Хочу застосувати бонус 10 TWA — бонус-сюрприз 🎁',
    },
  },
  {
    id: 'egypt-tours-3',
    price: 30,
    ru: {
      title: 'Экскурсии по Египту',
      description: 'Актуальный список экскурсий по Египту',
      location: 'Египет',
      duration: 'по запросу',
      chatMessage:
        'Здравствуйте! Хочу применить бонус 30 TWA: прошу актуальный список экскурсий по Египту.',
    },
    en: {
      title: 'Egypt tours',
      description: 'Up-to-date list of Egypt tours',
      location: 'Egypt',
      duration: 'on request',
      chatMessage:
        'Hello! I would like to apply a 30 TWA bonus: please send an up-to-date list of Egypt tours.',
    },
    uk: {
      title: 'Екскурсії по Єгипту',
      description: 'Актуальний список екскурсій по Єгипту',
      location: 'Єгипет',
      duration: 'за запитом',
      chatMessage:
        'Вітаю! Хочу застосувати бонус 30 TWA: прошу актуальний список екскурсій по Єгипту.',
    },
  },
  {
    id: 'couple-tours-10',
    price: 100,
    ru: {
      title: 'Экскурсии на двоих',
      description: 'Актуальный список экскурсий на двоих',
      location: 'любое направление',
      duration: 'по запросу',
      chatMessage:
        'Здравствуйте! Хочу применить бонус 100 TWA: прошу актуальный список экскурсий на двоих.',
    },
    en: {
      title: 'Tours for two',
      description: 'Up-to-date list of tours for two',
      location: 'any destination',
      duration: 'on request',
      chatMessage:
        'Hello! I would like to apply a 100 TWA bonus: please send an up-to-date list of tours for two.',
    },
    uk: {
      title: 'Екскурсії на двох',
      description: 'Актуальний список екскурсій на двох',
      location: 'будь-який напрямок',
      duration: 'за запитом',
      chatMessage:
        'Вітаю! Хочу застосувати бонус 100 TWA: прошу актуальний список екскурсій на двох.',
    },
  },
  {
    id: 'egypt-premium-15',
    price: 150,
    ru: {
      title: 'Премиум-экскурсии',
      description: 'Дорогие экскурсии на одного, Египет',
      location: 'Египет',
      duration: 'по запросу',
      chatMessage:
        'Здравствуйте! Хочу применить бонус 150 TWA: прошу актуальный список дорогих экскурсий на одного в Египте.',
    },
    en: {
      title: 'Premium tours',
      description: 'Premium solo tours, Egypt',
      location: 'Egypt',
      duration: 'on request',
      chatMessage:
        'Hello! I would like to apply a 150 TWA bonus: please send premium solo tours in Egypt.',
    },
    uk: {
      title: 'Преміум-екскурсії',
      description: 'Дорогі екскурсії на одного, Єгипет',
      location: 'Єгипет',
      duration: 'за запитом',
      chatMessage:
        'Вітаю! Хочу застосувати бонус 150 TWA: прошу актуальний список дорогих екскурсій на одного в Єгипті.',
    },
  },
  {
    id: 'egypt-couple-30',
    price: 300,
    ru: {
      title: 'Премиум на двоих',
      description: 'Дорогие экскурсии на двоих, Египет',
      location: 'Египет',
      duration: 'по запросу',
      chatMessage:
        'Здравствуйте! Хочу применить бонус 300 TWA: прошу актуальный список дорогих экскурсий на двоих в Египте.',
    },
    en: {
      title: 'Premium for two',
      description: 'Premium tours for two, Egypt',
      location: 'Egypt',
      duration: 'on request',
      chatMessage:
        'Hello! I would like to apply a 300 TWA bonus: please send premium tours for two in Egypt.',
    },
    uk: {
      title: 'Преміум на двох',
      description: 'Дорогі екскурсії на двох, Єгипет',
      location: 'Єгипет',
      duration: 'за запитом',
      chatMessage:
        'Вітаю! Хочу застосувати бонус 300 TWA: прошу актуальний список дорогих екскурсій на двох в Єгипті.',
    },
  },
  {
    id: 'hotel-mid-all-40',
    price: 400,
    ru: {
      title: 'Отель средний класс',
      description: 'All inclusive — Египет, Турция',
      location: 'Египет, Турция',
      duration: 'по запросу',
      chatMessage:
        'Здравствуйте! Хочу применить бонус 400 TWA: прошу актуальный список отелей среднего класса с питанием All (Египет, Турция).',
    },
    en: {
      title: 'Mid-range hotel',
      description: 'All inclusive — Egypt, Turkey',
      location: 'Egypt, Turkey',
      duration: 'on request',
      chatMessage:
        'Hello! I would like to apply a 400 TWA bonus: mid-range All inclusive hotels (Egypt, Turkey).',
    },
    uk: {
      title: 'Готель середній клас',
      description: 'All inclusive — Єгипет, Туреччина',
      location: 'Єгипет, Туреччина',
      duration: 'за запитом',
      chatMessage:
        'Вітаю! Хочу застосувати бонус 400 TWA: прошу список готелів середнього класу All (Єгипет, Туреччина).',
    },
  },
  {
    id: 'hotel-mid-hb-90',
    price: 900,
    ru: {
      title: 'Отель средний класс HB',
      description: 'Испания, Греция',
      location: 'Испания, Греция',
      duration: 'по запросу',
      chatMessage:
        'Здравствуйте! Хочу применить бонус 900 TWA: прошу актуальный список отелей среднего класса с питанием HB (Испания, Греция).',
    },
    en: {
      title: 'Mid-range hotel HB',
      description: 'Spain, Greece',
      location: 'Spain, Greece',
      duration: 'on request',
      chatMessage:
        'Hello! I would like to apply a 900 TWA bonus: mid-range HB hotels (Spain, Greece).',
    },
    uk: {
      title: 'Готель середній клас HB',
      description: 'Іспанія, Греція',
      location: 'Іспанія, Греція',
      duration: 'за запитом',
      chatMessage:
        'Вітаю! Хочу застосувати бонус 900 TWA: прошу список готелів середнього класу HB (Іспанія, Греція).',
    },
  },
  {
    id: 'hotel-upper-all-200',
    price: 2000,
    ru: {
      title: 'Отель выше среднего',
      description: 'All inclusive — Египет, Турция',
      location: 'Египет, Турция',
      duration: 'по запросу',
      chatMessage:
        'Здравствуйте! Хочу применить бонус 2000 TWA: прошу актуальный список отелей выше среднего с питанием All (Египет, Турция).',
    },
    en: {
      title: 'Upper mid hotel',
      description: 'All inclusive — Egypt, Turkey',
      location: 'Egypt, Turkey',
      duration: 'on request',
      chatMessage:
        'Hello! I would like to apply a 2000 TWA bonus: upper mid All inclusive hotels (Egypt, Turkey).',
    },
    uk: {
      title: 'Готель вище середнього',
      description: 'All inclusive — Єгипет, Туреччина',
      location: 'Єгипет, Туреччина',
      duration: 'за запитом',
      chatMessage:
        'Вітаю! Хочу застосувати бонус 2000 TWA: прошу список готелів вище середнього All (Єгипет, Туреччина).',
    },
  },
  {
    id: 'hotel-upper-couple-400',
    price: 4000,
    ru: {
      title: 'Отель выше среднего + трансфер',
      description: 'На двоих, All — Египет, Турция',
      location: 'Египет, Турция',
      duration: 'по запросу',
      chatMessage:
        'Здравствуйте! Хочу применить бонус 4000 TWA: отель выше среднего на двоих с All и трансфером (Египет, Турция).',
    },
    en: {
      title: 'Upper mid hotel + transfer',
      description: 'For two, All inclusive — Egypt, Turkey',
      location: 'Egypt, Turkey',
      duration: 'on request',
      chatMessage:
        'Hello! I would like to apply a 4000 TWA bonus: upper mid hotel for two with All and transfer (Egypt, Turkey).',
    },
    uk: {
      title: 'Готель вище середнього + трансфер',
      description: 'На двох, All — Єгипет, Туреччина',
      location: 'Єгипет, Туреччина',
      duration: 'за запитом',
      chatMessage:
        'Вітаю! Хочу застосувати бонус 4000 TWA: готель вище середнього на двох з All і трансфером (Єгипет, Туреччина).',
    },
  },
  {
    id: 'rixos-transfer-600',
    price: 6000,
    ru: {
      title: 'Rixos + трансфер',
      description: 'На одного человека',
      location: 'по запросу',
      duration: 'по запросу',
      chatMessage:
        'Здравствуйте! Хочу применить бонус 6000 TWA: Rixos + трансфер на одного человека.',
    },
    en: {
      title: 'Rixos + transfer',
      description: 'One person',
      location: 'on request',
      duration: 'on request',
      chatMessage:
        'Hello! I would like to apply a 6000 TWA bonus: Rixos + transfer for one person.',
    },
    uk: {
      title: 'Rixos + трансфер',
      description: 'На одну особу',
      location: 'за запитом',
      duration: 'за запитом',
      chatMessage:
        'Вітаю! Хочу застосувати бонус 6000 TWA: Rixos + трансфер на одну особу.',
    },
  },
  {
    id: 'rixos-transfer-800',
    price: 8000,
    ru: {
      title: 'Rixos + трансфер',
      description: 'На двоих человек',
      location: 'по запросу',
      duration: 'по запросу',
      chatMessage:
        'Здравствуйте! Хочу применить бонус 8000 TWA: Rixos + трансфер на двоих человек.',
    },
    en: {
      title: 'Rixos + transfer',
      description: 'Two persons',
      location: 'on request',
      duration: 'on request',
      chatMessage:
        'Hello! I would like to apply an 8000 TWA bonus: Rixos + transfer for two persons.',
    },
    uk: {
      title: 'Rixos + трансфер',
      description: 'На двох осіб',
      location: 'за запитом',
      duration: 'за запитом',
      chatMessage:
        'Вітаю! Хочу застосувати бонус 8000 TWA: Rixos + трансфер на двох осіб.',
    },
  },
];

const LOCALE_MAP: Record<Language, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  uk: 'uk-UA',
};

export function localizeRewardItem(
  entry: TwaRewardCatalogEntry,
  lang: Language,
): TwaRewardItem {
  const text = entry[lang] ?? entry.en;
  return {
    id: entry.id,
    price: entry.price,
    isSurprise: entry.isSurprise,
    title: text.title,
    description: text.description,
    location: text.location,
    duration: text.duration,
    chatMessage: text.chatMessage,
  };
}

export function getLocalizedRewardsCatalog(lang: Language): TwaRewardItem[] {
  return TWA_REWARDS_CATALOG.map((entry) => localizeRewardItem(entry, lang));
}

export function formatTwaPrice(price: number, lang: Language = 'ru'): string {
  return `${price.toLocaleString(LOCALE_MAP[lang])} TWA`;
}
