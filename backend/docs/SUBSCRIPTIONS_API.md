# API Абонементов

## Обзор

API для управления абонементами пользователей с системой подтверждения администратором.

## Workflow (Поток работы)

1. **Пользователь создает заявку** → статус `pending`, `is_active = 0`
2. **Администратор получает заявку** через `/api/subscriptions/requests?status=pending`
3. **Администратор подтверждает** через `/api/subscriptions/:id/approve`
4. **Абонемент активируется** → статус `confirmed`, `is_active = 1`
5. **Пользователь может использовать** абонемент для записи на занятия

## Endpoints

### 1. Создать заявку на абонемент

**POST** `/api/subscriptions`

**Требует аутентификации**: Да (Bearer token)

**Тело запроса:**
```json
{
  "subscriptionTypeId": 4,
  "bookingType": "flexible",
  "autoDirection": "pole-fit",
  "autoWeekdays": ["monday", "wednesday"],
  "firstName": "Иван",
  "lastName": "Иванов",
  "phone": "+79001234567",
  "address": "Волгина, 117А"
}
```

**Ответ:**
```json
{
  "message": "Заявка на абонемент создана и ожидает подтверждения администратором",
  "subscription": {
    "id": 1,
    "user_id": 1,
    "subscription_type_id": 4,
    "lessons_remaining": 8,
    "valid_from": "2024-11-24T12:00:00.000Z",
    "valid_until": "2024-12-24T12:00:00.000Z",
    "booking_type": "flexible",
    "status": "pending",
    "is_active": 0,
    "subscription_name": "8 занятий",
    "category": "КЛАССИЧЕСКИЙ",
    "price": 3800
  }
}
```

---

### 2. Получить свои абонементы

**GET** `/api/subscriptions/my`

**Требует аутентификации**: Да

**Ответ:**
```json
{
  "subscriptions": [
    {
      "id": 1,
      "status": "pending",
      "is_active": 0,
      "lessons_remaining": 8,
      "subscription_name": "8 занятий",
      "price": 3800
    }
  ]
}
```

---

### 3. Получить активные абонементы

**GET** `/api/subscriptions/active`

**Требует аутентификации**: Да

**Ответ:**
```json
{
  "subscriptions": [
    {
      "id": 1,
      "status": "confirmed",
      "is_active": 1,
      "lessons_remaining": 7,
      "valid_until": "2024-12-24T12:00:00.000Z"
    }
  ]
}
```

---

### 4. Получить все заявки (Админ)

**GET** `/api/subscriptions/requests?status=pending`

**Требует аутентификации**: Да (Admin)

**Query параметры:**
- `status` (опционально): `pending`, `confirmed`, `rejected`

**Ответ:**
```json
{
  "requests": [
    {
      "id": 1,
      "user_id": 1,
      "subscription_type_id": 4,
      "status": "pending",
      "first_name": "Иван",
      "last_name": "Иванов",
      "phone": "+79001234567",
      "username": "@ivan123",
      "telegram_id": "123456789",
      "subscription_name": "8 занятий",
      "price": 3800,
      "created_at": "2024-11-24T12:00:00.000Z"
    }
  ]
}
```

---

### 5. Подтвердить заявку (Админ)

**POST** `/api/subscriptions/:id/approve`

**Требует аутентификации**: Да (Admin)

**Ответ:**
```json
{
  "message": "Заявка подтверждена, абонемент активирован",
  "subscription": {
    "id": 1,
    "status": "confirmed",
    "is_active": 1,
    "valid_from": "2024-11-24T12:00:00.000Z"
  }
}
```

---

### 6. Отклонить заявку (Админ)

**POST** `/api/subscriptions/:id/reject`

**Требует аутентификации**: Да (Admin)

**Тело запроса:**
```json
{
  "reason": "Неполная информация"
}
```

**Ответ:**
```json
{
  "message": "Заявка отклонена",
  "reason": "Неполная информация"
}
```

---

## Статусы абонементов

| Статус      | Описание                                      |
|-------------|-----------------------------------------------|
| `pending`   | Ожидает подтверждения администратором         |
| `confirmed` | Подтвержден и активен                         |
| `rejected`  | Отклонен администратором                      |

## Типы бронирования

| Тип          | Описание                                                |
|--------------|---------------------------------------------------------|
| `flexible`   | Пользователь сам записывается на занятия               |
| `automatic`  | Автоматическая запись на выбранные дни недели          |

## Примеры использования (Frontend)

```typescript
// Создать заявку на абонемент
const response = await subscriptionsAPI.create({
  subscriptionTypeId: 4,
  bookingType: 'flexible',
  firstName: 'Иван',
  lastName: 'Иванов',
  phone: '+79001234567',
  address: 'Волгина, 117А'
});

// Получить свои абонементы
const mySubscriptions = await subscriptionsAPI.getMy();

// Получить активные абонементы
const activeSubscriptions = await subscriptionsAPI.getActive();

// (Админ) Получить заявки на подтверждение
const pendingRequests = await subscriptionsAPI.getRequests('pending');

// (Админ) Подтвердить заявку
await subscriptionsAPI.approve(1);

// (Админ) Отклонить заявку
await subscriptionsAPI.reject(1, 'Неполная информация');
```

## Безопасность

- Все endpoints требуют JWT токен в заголовке `Authorization: Bearer {token}`
- Админские endpoints дополнительно проверяют `is_admin = 1` в базе данных
- Пользователи могут видеть только свои абонементы
- Администраторы могут видеть все заявки всех пользователей

