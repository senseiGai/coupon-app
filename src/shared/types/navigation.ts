import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Auth Stack Navigator - стек авторизации
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/**
 * Root Stack Navigator - верхний уровень навигации
 * Содержит основные стеки и модальные окна
 */
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainStack: NavigatorScreenParams<MainStackParamList>;
  Modal: undefined;
  // Здесь можно добавить другие модальные окна или экраны вне основного потока
};

/**
 * Main Stack Navigator - основной стек приложения
 */
export type MainStackParamList = {
  Home: undefined;
  AppointmentDetail: { appointmentId: string };
  Archive: undefined;
  AddPatient: undefined;
  SelectAppointmentType: undefined;
  SelectInjectionZones: { appointmentType: string };
  // Здесь можно добавить другие экраны основного стека
};

/**
 * Типы для экранов Root Stack
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

/**
 * Типы для экранов Main Stack
 */
export type MainStackScreenProps<T extends keyof MainStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<MainStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

/**
 * Алиасы для конкретных экранов
 */
export type ModalScreenProps = RootStackScreenProps<'Modal'>;
export type HomeScreenProps = MainStackScreenProps<'Home'>;
export type AppointmentDetailScreenProps = MainStackScreenProps<'AppointmentDetail'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
