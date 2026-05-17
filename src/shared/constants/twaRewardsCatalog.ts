export type TwaRewardItem = {
  id: string;
  price: number;
  title: string;
  description: string;
  location?: string;
  duration?: string;
  chatMessage: string;
};

export const TWA_REWARDS_CATALOG: TwaRewardItem[] = [
  {
    id: 'egypt-tours-3',
    price: 3,
    title: 'Экскурсии по Египту',
    description: 'Актуальный список экскурсий по Египту',
    location: 'Египет',
    duration: 'по запросу',
    chatMessage:
      'Здравствуйте! Хочу применить бонус 3 TWA: прошу актуальный список экскурсий по Египту.',
  },
  {
    id: 'couple-tours-10',
    price: 10,
    title: 'Экскурсии на двоих',
    description: 'Актуальный список экскурсий на двоих',
    location: 'любое направление',
    duration: 'по запросу',
    chatMessage:
      'Здравствуйте! Хочу применить бонус 10 TWA: прошу актуальный список экскурсий на двоих.',
  },
  {
    id: 'egypt-premium-15',
    price: 15,
    title: 'Премиум-экскурсии',
    description: 'Дорогие экскурсии на одного, Египет',
    location: 'Египет',
    duration: 'по запросу',
    chatMessage:
      'Здравствуйте! Хочу применить бонус 15 TWA: прошу актуальный список дорогих экскурсий на одного в Египте.',
  },
  {
    id: 'egypt-couple-30',
    price: 30,
    title: 'Премиум на двоих',
    description: 'Дорогие экскурсии на двоих, Египет',
    location: 'Египет',
    duration: 'по запросу',
    chatMessage:
      'Здравствуйте! Хочу применить бонус 30 TWA: прошу актуальный список дорогих экскурсий на двоих в Египте.',
  },
  {
    id: 'hotel-mid-all-40',
    price: 40,
    title: 'Отель средний класс',
    description: 'All inclusive — Египет, Турция',
    location: 'Египет, Турция',
    duration: 'по запросу',
    chatMessage:
      'Здравствуйте! Хочу применить бонус 40 TWA: прошу актуальный список отелей среднего класса с питанием All (Египет, Турция).',
  },
  {
    id: 'hotel-mid-hb-90',
    price: 90,
    title: 'Отель средний класс HB',
    description: 'Испания, Греция',
    location: 'Испания, Греция',
    duration: 'по запросу',
    chatMessage:
      'Здравствуйте! Хочу применить бонус 90 TWA: прошу актуальный список отелей среднего класса с питанием HB (Испания, Греция).',
  },
  {
    id: 'hotel-upper-all-200',
    price: 200,
    title: 'Отель выше среднего',
    description: 'All inclusive — Египет, Турция',
    location: 'Египет, Турция',
    duration: 'по запросу',
    chatMessage:
      'Здравствуйте! Хочу применить бонус 200 TWA: прошу актуальный список отелей выше среднего с питанием All (Египет, Турция).',
  },
  {
    id: 'hotel-upper-couple-400',
    price: 400,
    title: 'Отель выше среднего + трансфер',
    description: 'На двоих, All — Египет, Турция',
    location: 'Египет, Турция',
    duration: 'по запросу',
    chatMessage:
      'Здравствуйте! Хочу применить бонус 400 TWA: отель выше среднего на двоих с All и трансфером (Египет, Турция).',
  },
  {
    id: 'rixos-transfer-600',
    price: 600,
    title: 'Rixos + трансфер',
    description: 'На одного человека',
    location: 'по запросу',
    duration: 'по запросу',
    chatMessage:
      'Здравствуйте! Хочу применить бонус 600 TWA: Rixos + трансфер на одного человека.',
  },
  {
    id: 'rixos-transfer-800',
    price: 800,
    title: 'Rixos + трансфер',
    description: 'На двоих человек',
    location: 'по запросу',
    duration: 'по запросу',
    chatMessage:
      'Здравствуйте! Хочу применить бонус 800 TWA: Rixos + трансфер на двоих человек.',
  },
];
