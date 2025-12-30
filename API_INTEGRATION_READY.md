# 🚀 API Integration - Готово к использованию

## ✅ Что установлено и настроено:

### 1. Зависимости

- ✅ `axios` - HTTP клиент
- ✅ `@react-native-async-storage/async-storage` - хранение токенов
- ✅ `@tanstack/react-query` - управление состоянием API

### 2. Структура проекта

```
src/
├── entities/              # API сервисы
│   ├── auth/model/authService.ts
│   ├── user/model/userService.ts
│   ├── tour/model/tourService.ts
│   └── document/model/documentService.ts
│
├── shared/
│   ├── config/api.ts      # Конфигурация API (измените BASE_URL!)
│   ├── lib/
│   │   ├── api/apiClient.ts  # Axios с interceptors
│   │   └── hooks/         # React Query хуки
│   │       ├── useAuth.ts
│   │       ├── useUser.ts
│   │       ├── useTours.ts
│   │       └── useDocuments.ts
│   └── types/             # TypeScript типы
│       ├── api.ts
│       ├── auth.ts
│       ├── user.ts
│       ├── tour.ts
│       └── document.ts
│
└── app/
    ├── providers/ApiProvider.tsx  # React Query Provider
    └── navigation/RootNavigator.tsx  # С проверкой авторизации
```

---

## 🔧 Первоначальная настройка

### Шаг 1: Измените URL API

Откройте `/src/shared/config/api.ts` и измените базовый URL:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-production-api.com', // ⚠️ ИЗМЕНИТЕ ЭТО!
  // или для локальной разработки:
  // BASE_URL: 'http://192.168.1.100:3000', // Ваш локальный IP
};
```

### Шаг 2: Провайдер уже подключен

В `App.tsx` уже обернуто в `<ApiProvider>` - ничего делать не нужно.

---

## 📱 Примеры использования

### Авторизация

```typescript
import { useLogin, useRegister, useLogout } from '@/shared/lib/hooks';

// В компоненте логина
const LoginScreen = () => {
  const loginMutation = useLogin();

  const handleLogin = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      // Автоматически перенаправит на MainStack
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  return (
    <Button
      onPress={() => handleLogin('user@example.com', 'password')}
      disabled={loginMutation.isPending}
    >
      {loginMutation.isPending ? 'Вход...' : 'Войти'}
    </Button>
  );
};
```

### Получение данных

```typescript
import { useTours, useBalance } from '@/shared/lib/hooks';

const HomePage = () => {
  const { data: tours, isLoading: toursLoading } = useTours();
  const { data: balanceData, isLoading: balanceLoading } = useBalance();

  if (toursLoading || balanceLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>Баланс: {balanceData?.balance} ₽</Text>
      <FlatList
        data={tours}
        renderItem={({ item }) => <TourCard tour={item} />}
      />
    </View>
  );
};
```

### Загрузка документов

```typescript
import { useUploadDocument } from '@/shared/lib/hooks';
import * as DocumentPicker from 'expo-document-picker';

const DocumentsScreen = () => {
  const uploadMutation = useUploadDocument();
  const [progress, setProgress] = useState(0);

  const pickAndUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync();
    if (result.canceled) return;

    const file = result.assets[0];

    await uploadMutation.mutateAsync({
      file: {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      },
      onProgress: setProgress,
    });
  };

  return (
    <View>
      <Button onPress={pickAndUpload}>Загрузить документ</Button>
      {uploadMutation.isPending && <Text>Загрузка: {progress}%</Text>}
    </View>
  );
};
```

---

## 🎯 Доступные хуки

### Авторизация

- `useLogin()` - вход
- `useRegister()` - регистрация
- `useLogout()` - выход
- `useProfile()` - получить профиль
- `useIsAuthenticated()` - проверка авторизации

### Пользователь

- `useBalance()` - получить баланс
- `useAddBalance()` - добавить к балансу
- `useSetBalance()` - установить баланс

### Туры

- `useTours()` - список туров
- `useTour(id)` - один тур
- `usePrefetchTour()` - предзагрузка

### Документы

- `useDocuments()` - список документов
- `useDocument(id)` - один документ
- `useUploadDocument()` - загрузить
- `useDeleteDocument()` - удалить

---

## 🔐 Как работает авторизация

1. При успешном логине/регистрации токен **автоматически сохраняется** в AsyncStorage
2. **Все запросы автоматически** включают токен в заголовок `Authorization`
3. При ошибке 401 токен **автоматически удаляется**
4. `RootNavigator` **автоматически** переключает между AuthStack и MainStack

---

## 📝 Полные примеры

Смотрите файл `API_USAGE_EXAMPLES.md` для детальных примеров каждого экрана.

---

## 🐛 Отладка

### Проблема: "Network request failed"

**Решение для локальной разработки:**

```typescript
// В api.ts используйте IP вместо localhost
BASE_URL: 'http://192.168.1.100:3000', // Ваш локальный IP
```

Найти IP:

- macOS: `ifconfig | grep inet`
- Windows: `ipconfig`

### Проблема: "401 Unauthorized"

Токен истек или невалиден. Проверьте:

1. Сервер запущен?
2. Правильный BASE_URL?
3. Попробуйте заново залогиниться

### Проблема: CORS ошибки

CORS не влияет на React Native - это только для браузеров.

---

## 🚀 Готово к работе!

Все настроено и работает. Начните с изменения `BASE_URL` и используйте хуки в ваших компонентах.

**Удачной разработки! 🎉**
