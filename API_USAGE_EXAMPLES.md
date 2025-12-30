# Примеры использования API в мобильном приложении

## Быстрый старт

### 1. Импорты

```typescript
import {
  useLogin,
  useRegister,
  useProfile,
  useLogout,
  useBalance,
  useTours,
  useTour,
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
} from '@/shared/lib/hooks';
```

---

## Авторизация

### Вход в систему

```typescript
import { useLogin } from '@/shared/lib/hooks';

const LoginScreen = () => {
  const loginMutation = useLogin();

  const handleLogin = async () => {
    try {
      const result = await loginMutation.mutateAsync({
        email: 'user@example.com',
        password: 'password123',
      });

      console.log('Logged in:', result.user);
      // Токен автоматически сохранен
      // Навигация на главный экран
    } catch (error) {
      console.error('Login error:', error.message);
    }
  };

  return (
    <View>
      <Button
        onPress={handleLogin}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Вход...' : 'Войти'}
      </Button>

      {loginMutation.isError && (
        <Text>Ошибка: {loginMutation.error.message}</Text>
      )}
    </View>
  );
};
```

### Регистрация

```typescript
import { useRegister } from '@/shared/lib/hooks';

const RegisterScreen = () => {
  const registerMutation = useRegister();

  const handleRegister = async () => {
    try {
      const result = await registerMutation.mutateAsync({
        email: 'newuser@example.com',
        password: 'password123',
      });

      console.log('Registered:', result);
      // Токен автоматически сохранен
    } catch (error) {
      console.error('Registration error:', error.message);
    }
  };

  return (
    <Button
      onPress={handleRegister}
      disabled={registerMutation.isPending}
    >
      Зарегистрироваться
    </Button>
  );
};
```

### Получение профиля

```typescript
import { useProfile } from '@/shared/lib/hooks';

const ProfileScreen = () => {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Ошибка: {error.message}</Text>;

  return (
    <View>
      <Text>Email: {profile.email}</Text>
      <Text>Баланс: {profile.balance}</Text>
      <Text>Роль: {profile.role}</Text>
    </View>
  );
};
```

### Выход

```typescript
import { useLogout } from '@/shared/lib/hooks';

const LogoutButton = () => {
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    // Навигация на экран входа
  };

  return <Button onPress={handleLogout}>Выйти</Button>;
};
```

---

## Баланс пользователя

### Получение баланса

```typescript
import { useBalance } from '@/shared/lib/hooks';

const BalanceScreen = () => {
  const { data: balanceData, isLoading, refetch } = useBalance();

  return (
    <View>
      <Text>Баланс: {balanceData?.balance || 0} ₽</Text>
      <Button onPress={() => refetch()}>Обновить</Button>
    </View>
  );
};
```

### Добавление баланса

```typescript
import { useAddBalance } from '@/shared/lib/hooks';

const TopUpScreen = () => {
  const addBalanceMutation = useAddBalance();

  const handleTopUp = async (amount: number) => {
    try {
      const result = await addBalanceMutation.mutateAsync({ amount });
      console.log('Новый баланс:', result.balance);
      Alert.alert('Успех', `Баланс пополнен на ${amount} ₽`);
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  return (
    <Button onPress={() => handleTopUp(1000)}>
      Пополнить на 1000 ₽
    </Button>
  );
};
```

---

## Туры

### Список всех туров

```typescript
import { useTours } from '@/shared/lib/hooks';

const ToursScreen = () => {
  const { data: tours, isLoading, error, refetch } = useTours();

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Ошибка: {error.message}</Text>;

  return (
    <FlatList
      data={tours}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View>
          <Image source={{ uri: item.imageUrl }} />
          <Text>{item.title}</Text>
          <Text>{item.description}</Text>
          <Text>Цена: {item.price} ₽</Text>
          <Text>Длительность: {item.duration}</Text>
          <Text>Место: {item.location}</Text>
        </View>
      )}
      refreshing={isLoading}
      onRefresh={refetch}
    />
  );
};
```

### Детали тура

```typescript
import { useTour } from '@/shared/lib/hooks';

const TourDetailScreen = ({ route }) => {
  const tourId = route.params.tourId;
  const { data: tour, isLoading } = useTour(tourId);

  if (isLoading) return <ActivityIndicator />;
  if (!tour) return <Text>Тур не найден</Text>;

  return (
    <ScrollView>
      <Image source={{ uri: tour.imageUrl }} />
      <Text style={styles.title}>{tour.title}</Text>
      <Text>{tour.description}</Text>
      <Text>Цена: {tour.price} ₽</Text>
      <Text>Длительность: {tour.duration}</Text>
      <Text>Локация: {tour.location}</Text>
      <Button title="Купить тур">Забронировать</Button>
    </ScrollView>
  );
};
```

### Prefetch (предзагрузка) тура

```typescript
import { usePrefetchTour } from '@/shared/lib/hooks';

const ToursList = () => {
  const prefetchTour = usePrefetchTour();

  return (
    <FlatList
      data={tours}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPressIn={() => prefetchTour(item.id)} // Предзагрузка при касании
          onPress={() => navigation.navigate('TourDetail', { tourId: item.id })}
        >
          <Text>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
};
```

---

## Документы

### Список документов

```typescript
import { useDocuments } from '@/shared/lib/hooks';

const DocumentsScreen = () => {
  const { data: documents, isLoading } = useDocuments();

  if (isLoading) return <ActivityIndicator />;

  return (
    <FlatList
      data={documents}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.originalName}</Text>
          <Text>Размер: {(item.size / 1024).toFixed(2)} KB</Text>
          <Text>Тип: {item.mimetype}</Text>
          <Text>Дата: {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      )}
    />
  );
};
```

### Загрузка документа

```typescript
import { useUploadDocument } from '@/shared/lib/hooks';
import * as DocumentPicker from 'expo-document-picker';

const UploadDocumentScreen = () => {
  const uploadMutation = useUploadDocument();
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePickAndUpload = async () => {
    try {
      // Выбираем файл
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // Загружаем файл с прогрессом
      await uploadMutation.mutateAsync({
        file: {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        },
        onProgress: (progress) => {
          setUploadProgress(progress);
          console.log(`Загрузка: ${progress}%`);
        },
      });

      Alert.alert('Успех', 'Документ загружен');
      setUploadProgress(0);
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  return (
    <View>
      <Button
        onPress={handlePickAndUpload}
        disabled={uploadMutation.isPending}
      >
        Загрузить документ
      </Button>

      {uploadMutation.isPending && (
        <View>
          <Text>Загрузка: {uploadProgress}%</Text>
          <ProgressBar progress={uploadProgress / 100} />
        </View>
      )}
    </View>
  );
};
```

### Удаление документа

```typescript
import { useDeleteDocument } from '@/shared/lib/hooks';

const DocumentItem = ({ document }) => {
  const deleteMutation = useDeleteDocument();

  const handleDelete = async () => {
    Alert.alert(
      'Удалить документ?',
      'Это действие нельзя отменить',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(document.id);
              Alert.alert('Успех', 'Документ удален');
            } catch (error) {
              Alert.alert('Ошибка', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      <Text>{document.originalName}</Text>
      <Button onPress={handleDelete} disabled={deleteMutation.isPending}>
        Удалить
      </Button>
    </View>
  );
};
```

---

## Полный пример экрана с чатом

```typescript
import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useProfile, useBalance, useTours } from '@/shared/lib/hooks';

const ChatScreen = () => {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: balanceData, isLoading: balanceLoading } = useBalance();
  const { data: tours, isLoading: toursLoading } = useTours();

  const isLoading = profileLoading || balanceLoading || toursLoading;

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View>
      <Text>Привет, {profile?.email}!</Text>
      <Text>Ваш баланс: {balanceData?.balance} ₽</Text>
      <Text>Доступно туров: {tours?.length || 0}</Text>

      {/* Ваш чат UI */}
    </View>
  );
};

export default ChatScreen;
```

---

## Обработка ошибок

```typescript
import { ApiError } from '@/shared/types';

const MyComponent = () => {
  const { data, error } = useTours();

  if (error) {
    const apiError = error as ApiError;

    switch (apiError.statusCode) {
      case 401:
        // Перенаправить на логин
        navigation.navigate('Login');
        break;
      case 403:
        Alert.alert('Доступ запрещен');
        break;
      case 404:
        Alert.alert('Не найдено');
        break;
      case 500:
        Alert.alert('Ошибка сервера', 'Попробуйте позже');
        break;
      default:
        Alert.alert('Ошибка', apiError.message);
    }
  }

  return <View>...</View>;
};
```

---

## Настройка базового URL

Измените URL API в файле `/src/shared/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-api.com', // Замените на ваш URL
  // ...
};
```

---

## Проверка авторизации

```typescript
import { useIsAuthenticated } from '@/shared/lib/hooks';

const RootNavigator = () => {
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();

  if (isLoading) return <SplashScreen />;

  return isAuthenticated ? <MainStack /> : <AuthStack />;
};
```

---

## Ручная работа с сервисами (без хуков)

```typescript
import { authService, tourService, documentService } from '@/entities';

// Прямой вызов API
const login = async () => {
  try {
    const result = await authService.login({
      email: 'user@example.com',
      password: 'password',
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

const getTours = async () => {
  const tours = await tourService.getAllTours();
  return tours;
};
```

---

## Важные замечания

1. **Токены сохраняются автоматически** - не нужно вручную работать с AsyncStorage
2. **Кеширование работает из коробки** - данные обновляются автоматически
3. **Optimistic updates** - UI обновляется до получения ответа от сервера
4. **Автоматический retry** - запросы повторяются при ошибках сети
5. **Типобезопасность** - все запросы и ответы типизированы

---

## Структура проекта

```
src/
├── entities/              # Сервисы для работы с API
│   ├── auth/
│   ├── user/
│   ├── tour/
│   └── document/
├── shared/
│   ├── config/
│   │   └── api.ts        # Конфигурация API
│   ├── lib/
│   │   ├── api/
│   │   │   └── apiClient.ts  # Axios клиент
│   │   └── hooks/        # React Query хуки
│   └── types/            # TypeScript типы
└── app/
    └── providers/
        └── ApiProvider.tsx  # React Query провайдер
```
