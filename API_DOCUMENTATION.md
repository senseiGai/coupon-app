# Полная API документация

## Содержание

- [Авторизация и аутентификация](#авторизация-и-аутентификация)
- [Пользователи (Users)](#пользователи-users)
- [Туры (Tours)](#туры-tours)
- [Документы (Documents)](#документы-documents)
- [Админ панель - Пользователи](#админ-панель---пользователи)
- [Админ панель - Туры](#админ-панель---туры)
- [Админ панель - Документы](#админ-панель---документы)

---

# Авторизация и аутентификация

## Базовый URL: `/auth`

### 1. Регистрация пользователя

**POST** `/auth/register`

Регистрация нового пользователя с ролью `USER`.

**Тело запроса:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "balance": 0,
  "role": "USER",
  "createdAt": "2025-12-30T10:00:00.000Z",
  "updatedAt": "2025-12-30T10:00:00.000Z",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Регистрация администратора

**POST** `/auth/register/admin`

> ⚠️ В продакшене этот эндпоинт должен быть защищен или удален.

**Тело запроса:**

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Ответ:** Аналогичен регистрации пользователя, но с ролью `ADMIN`.

---

### 3. Вход пользователя

**POST** `/auth/login`

**Тело запроса:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER",
    "balance": 0
  }
}
```

---

### 4. Вход администратора

**POST** `/auth/admin/login`

Вход только для пользователей с ролью `ADMIN`.

**Тело запроса:**

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Ответ:** Аналогичен обычному входу.

**Ошибка (если не админ):**

```json
{
  "statusCode": 401,
  "message": "Access denied. Admin only."
}
```

---

### 5. Получить профиль

**GET** `/auth/profile`

**Требуется:** JWT токен

**Заголовки:**

```
Authorization: Bearer <access_token>
```

**Ответ:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "USER",
  "balance": 0,
  "iat": 1735555200,
  "exp": 1735641600
}
```

---

# Пользователи (Users)

## Базовый URL: `/users`

**Требуется авторизация:** Все эндпоинты требуют JWT токен

### 1. Получить баланс

**GET** `/users/balance`

**Заголовки:**

```
Authorization: Bearer <access_token>
```

**Ответ:**

```json
{
  "balance": 1000.5
}
```

---

### 2. Добавить к балансу

**POST** `/users/balance/add`

Увеличивает баланс пользователя на указанную сумму.

**Заголовки:**

```
Authorization: Bearer <access_token>
```

**Тело запроса:**

```json
{
  "amount": 500
}
```

**Ответ:**

```json
{
  "balance": 1500.5
}
```

---

### 3. Установить баланс

**POST** `/users/balance/set`

Устанавливает баланс пользователя на конкретное значение.

**Заголовки:**

```
Authorization: Bearer <access_token>
```

**Тело запроса:**

```json
{
  "amount": 2000
}
```

**Ответ:**

```json
{
  "balance": 2000
}
```

---

# Туры (Tours)

## Базовый URL: `/tours`

### 1. Получить все активные туры

**GET** `/tours`

**Требуется авторизация:** Нет

**Ответ:**

```json
[
  {
    "id": 1,
    "title": "Тур в Париж",
    "description": "Незабываемое путешествие в столицу Франции",
    "price": 1500.0,
    "duration": "7 дней",
    "location": "Париж, Франция",
    "imageUrl": "https://example.com/paris.jpg",
    "isActive": true,
    "createdAt": "2025-12-30T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:00:00.000Z"
  }
]
```

---

### 2. Получить тур по ID

**GET** `/tours/:id`

**Требуется авторизация:** Нет

**Параметры:**

- `id` (number) - ID тура

**Пример запроса:**

```
GET /tours/1
```

**Ответ:**

```json
{
  "id": 1,
  "title": "Тур в Париж",
  "description": "Незабываемое путешествие в столицу Франции",
  "price": 1500.0,
  "duration": "7 дней",
  "location": "Париж, Франция",
  "imageUrl": "https://example.com/paris.jpg",
  "isActive": true,
  "createdAt": "2025-12-30T10:00:00.000Z",
  "updatedAt": "2025-12-30T10:00:00.000Z"
}
```

---

# Документы (Documents)

## Базовый URL: `/documents`

**Требуется авторизация:** Все эндпоинты требуют JWT токен

### 1. Загрузить документ

**POST** `/documents/upload`

Загрузить документ для текущего пользователя. Максимальный размер файла: 10MB.

**Заголовки:**

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Тело запроса:**

- `file` (file) - файл документа

**Пример (JavaScript):**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/documents/upload', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

**Ответ:**

```json
{
  "id": "uuid",
  "userId": 1,
  "originalName": "passport.pdf",
  "filename": "a1b2c3d4-e5f6-7890.pdf",
  "mimetype": "application/pdf",
  "size": 1024000,
  "url": "http://localhost:3000/uploads/a1b2c3d4-e5f6-7890.pdf",
  "createdAt": "2025-12-30T10:00:00.000Z"
}
```

---

### 2. Получить все свои документы

**GET** `/documents`

**Заголовки:**

```
Authorization: Bearer <access_token>
```

**Ответ:**

```json
[
  {
    "id": "uuid",
    "userId": 1,
    "originalName": "passport.pdf",
    "filename": "a1b2c3d4-e5f6-7890.pdf",
    "mimetype": "application/pdf",
    "size": 1024000,
    "url": "http://localhost:3000/uploads/a1b2c3d4-e5f6-7890.pdf",
    "createdAt": "2025-12-30T10:00:00.000Z"
  }
]
```

---

### 3. Получить документ по ID

**GET** `/documents/:id`

**Заголовки:**

```
Authorization: Bearer <access_token>
```

**Параметры:**

- `id` (string) - UUID документа

**Пример запроса:**

```
GET /documents/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Ответ:** Объект документа или ошибка, если не найден.

---

### 4. Удалить документ

**DELETE** `/documents/:id`

**Заголовки:**

```
Authorization: Bearer <access_token>
```

**Параметры:**

- `id` (string) - UUID документа

**Ответ:**

```json
{
  "message": "Document deleted successfully"
}
```

---

# Админ панель - Пользователи

## Базовый URL: `/admin`

**Требуется:** JWT токен с ролью `ADMIN`

**Заголовки для всех запросов:**

```
Authorization: Bearer <admin_token>
```

### 1. Получить всех пользователей

**GET** `/admin/users`

**Ответ:**

```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "balance": 1000,
    "role": "USER",
    "createdAt": "2025-12-30T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:00:00.000Z"
  }
]
```

---

### 2. Получить пользователя по ID

**GET** `/admin/users/:id`

**Параметры:**

- `id` (number) - ID пользователя

**Пример запроса:**

```
GET /admin/users/5
```

**Ответ:**

```json
{
  "id": 5,
  "email": "user@example.com",
  "balance": 1000,
  "role": "USER",
  "createdAt": "2025-12-30T10:00:00.000Z",
  "updatedAt": "2025-12-30T10:00:00.000Z"
}
```

---

### 3. Получить баланс пользователя

**GET** `/admin/users/:id/balance`

**Параметры:**

- `id` (number) - ID пользователя

**Ответ:**

```json
{
  "userId": 5,
  "balance": 1000
}
```

---

### 4. Установить баланс пользователя

**PUT** `/admin/users/:id/balance`

**Параметры:**

- `id` (number) - ID пользователя

**Тело запроса:**

```json
{
  "balance": 5000
}
```

**Ответ:**

```json
{
  "userId": 5,
  "balance": 5000
}
```

---

### 5. Изменить роль пользователя

**PUT** `/admin/users/:id/role`

**Параметры:**

- `id` (number) - ID пользователя

**Тело запроса:**

```json
{
  "role": "ADMIN"
}
```

Допустимые значения: `"USER"`, `"ADMIN"`

**Ответ:**

```json
{
  "id": 5,
  "email": "user@example.com",
  "balance": 1000,
  "role": "ADMIN",
  "createdAt": "2025-12-30T10:00:00.000Z",
  "updatedAt": "2025-12-30T10:00:00.000Z"
}
```

---

# Админ панель - Туры

## Базовый URL: `/admin`

**Требуется:** JWT токен с ролью `ADMIN`

### 1. Получить все туры

**GET** `/admin/tours`

Возвращает все туры, включая неактивные.

**Ответ:**

```json
[
  {
    "id": 1,
    "title": "Тур в Париж",
    "description": "Незабываемое путешествие",
    "price": 1500.0,
    "duration": "7 дней",
    "location": "Париж, Франция",
    "imageUrl": "https://example.com/paris.jpg",
    "isActive": true,
    "createdAt": "2025-12-30T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:00:00.000Z"
  }
]
```

---

### 2. Создать тур

**POST** `/admin/tours`

**Тело запроса:**

```json
{
  "title": "Тур в Рим",
  "description": "Исторический тур по Риму",
  "price": 1800,
  "duration": "5 дней",
  "location": "Рим, Италия",
  "imageUrl": "https://example.com/rome.jpg"
}
```

**Ответ:** Созданный объект тура.

---

### 3. Обновить тур

**PUT** `/admin/tours/:id`

**Параметры:**

- `id` (number) - ID тура

**Тело запроса (все поля опциональны):**

```json
{
  "title": "Новое название",
  "price": 2000,
  "isActive": false
}
```

**Ответ:** Обновленный объект тура.

---

### 4. Удалить тур

**DELETE** `/admin/tours/:id`

**Параметры:**

- `id` (number) - ID тура

**Ответ:**

```json
{
  "message": "Tour deleted successfully"
}
```

---

### 5. Переключить активность тура

**PUT** `/admin/tours/:id/toggle`

Меняет статус `isActive` на противоположный.

**Параметры:**

- `id` (number) - ID тура

**Ответ:** Обновленный объект тура.

---

# Админ панель - Документы

## Базовый URL: `/admin`

**Требуется:** JWT токен с ролью `ADMIN`

### 1. Получить все документы в системе

**GET** `/admin/documents`

Возвращает все документы от всех пользователей с информацией о владельцах.

**Ответ:**

```json
[
  {
    "id": "uuid",
    "userId": 1,
    "originalName": "passport.pdf",
    "filename": "a1b2c3d4e5f6.pdf",
    "mimetype": "application/pdf",
    "size": 1024000,
    "url": "http://localhost:3000/uploads/a1b2c3d4e5f6.pdf",
    "createdAt": "2025-12-30T10:00:00.000Z",
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  }
]
```

---

### 2. Получить документы пользователя

**GET** `/admin/users/:userId/documents`

**Параметры:**

- `userId` (number) - ID пользователя

**Ответ:** Массив документов пользователя.

---

### 3. Загрузить документ пользователю

**POST** `/admin/users/:userId/documents`

Загружает документ и прикрепляет его к указанному пользователю.

**Параметры:**

- `userId` (number) - ID пользователя

**Content-Type:** `multipart/form-data`

**Тело запроса:**

- `file` (file) - файл документа

**Пример (curl):**

```bash
curl -X POST http://localhost:3000/admin/users/5/documents \
  -H "Authorization: Bearer <admin_token>" \
  -F "file=@/path/to/document.pdf"
```

**Ответ:**

```json
{
  "id": "uuid",
  "userId": 5,
  "originalName": "document.pdf",
  "filename": "a1b2c3d4e5f6.pdf",
  "mimetype": "application/pdf",
  "size": 1024000,
  "url": "http://localhost:3000/uploads/a1b2c3d4e5f6.pdf",
  "createdAt": "2025-12-30T10:00:00.000Z"
}
```

---

### 4. Переприкрепить документ к другому пользователю

**PUT** `/admin/documents/:documentId/assign/:userId`

Переназначает существующий документ другому пользователю.

**Параметры:**

- `documentId` (string) - UUID документа
- `userId` (number) - ID нового пользователя

**Пример запроса:**

```
PUT /admin/documents/a1b2c3d4-e5f6-7890-abcd-ef1234567890/assign/10
```

**Ответ:** Обновленный объект документа.

---

### 5. Удалить документ

**DELETE** `/admin/documents/:documentId`

Удаляет документ из базы данных и с диска сервера.

**Параметры:**

- `documentId` (string) - UUID документа

**Ответ:**

```json
{
  "message": "Document deleted successfully"
}
```

---

## Коды ошибок

- **400 Bad Request** - Неверные данные запроса
- **401 Unauthorized** - Не авторизован или токен недействителен
- **403 Forbidden** - Недостаточно прав (требуется роль ADMIN)
- **404 Not Found** - Ресурс не найден
- **500 Internal Server Error** - Ошибка сервера

---

## Примеры использования

### Полный цикл работы с API

```typescript
// 1. Регистрация
const registerResponse = await fetch('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});
const { access_token } = await registerResponse.json();

// 2. Получить свой профиль
const profileResponse = await fetch('/auth/profile', {
  headers: { Authorization: `Bearer ${access_token}` },
});
const profile = await profileResponse.json();

// 3. Получить туры
const toursResponse = await fetch('/tours');
const tours = await toursResponse.json();

// 4. Загрузить документ
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await fetch('/documents/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${access_token}` },
  body: formData,
});
const document = await uploadResponse.json();

// 5. Проверить баланс
const balanceResponse = await fetch('/users/balance', {
  headers: { Authorization: `Bearer ${access_token}` },
});
const { balance } = await balanceResponse.json();
```

### Админские операции

```typescript
// Получить всех пользователей
const usersResponse = await fetch('/admin/users', {
  headers: { Authorization: `Bearer ${adminToken}` },
});
const users = await usersResponse.json();

// Установить баланс пользователю
await fetch('/admin/users/5/balance', {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ balance: 5000 }),
});

// Загрузить документ пользователю
const formData = new FormData();
formData.append('file', file);

await fetch('/admin/users/5/documents', {
  method: 'POST',
  headers: { Authorization: `Bearer ${adminToken}` },
  body: formData,
});

// Создать новый тур
await fetch('/admin/tours', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Тур в Барселону',
    description: 'Путешествие по Испании',
    price: 1600,
    duration: '6 дней',
    location: 'Барселона, Испания',
    imageUrl: 'https://example.com/barcelona.jpg',
  }),
});
```
