# Поток работы с абонементами

## Описание системы

Система абонементов позволяет клиентам выбирать и покупать абонементы на занятия, а администраторам — управлять заявками и активными абонементами.

## Статусы абонементов

| Статус | Описание | is_active |
|--------|----------|-----------|
| `pending` | Ожидает подтверждения администратором | 0 |
| `confirmed` | Подтвержден и активен | 1 |
| `rejected` | Отклонен администратором | 0 |
| `expired` | Истек срок действия | 0 |
| `completed` | Все занятия использованы | 0 |

## Жизненный цикл абонемента

### 1. Создание заявки (Клиент)

**Endpoint**: `POST /api/subscriptions`

**Действие**:
- Клиент выбирает тип абонемента
- Заполняет форму с данными:
  - Имя, фамилия, телефон
  - Адрес зала
  - Тип записи (гибкая/автоматическая)
  - Направление (для автоматической записи)
- Отправляет заявку

**Результат**:
- Создается запись в БД со статусом `pending`
- `is_active = 0`
- `lessons_remaining` = количество занятий из типа абонемента
- Клиент видит сообщение: "Ваша запись принята, как администратор подтвердит, вы сможете начать заниматься"

### 2. Просмотр в личном кабинете (Клиент)

**Endpoint**: `GET /api/subscriptions/my`

**Отображение**:
- Список всех абонементов пользователя
- Для каждого абонемента:
  - Название и категория
  - Статус:
    - `pending` → "Ожидает подтверждения"
    - `confirmed` → "Активна"
    - `rejected` → "Отклонена" + причина
    - `expired` → "Истекла"
    - `completed` → "Завершена"
  - Количество оставшихся занятий
  - Срок действия (дата окончания)
  - Адрес зала

### 3. Управление заявками (Администратор)

**Endpoint**: `GET /api/subscriptions/requests?status=pending`

**Действия администратора**:

#### a) Подтверждение заявки
**Endpoint**: `POST /api/subscriptions/:id/approve`

**Результат**:
- `status` → `confirmed`
- `is_active` → `1`
- `valid_from` → текущая дата
- Пользователь получает уведомление

#### b) Отклонение заявки
**Endpoint**: `POST /api/subscriptions/:id/reject`

**Параметры**:
```json
{
  "reason": "Причина отказа"
}
```

**Результат**:
- `status` → `rejected`
- `is_active` → `0`
- `rejection_reason` → сохраняется причина
- Пользователь получает уведомление с причиной

### 4. Использование абонемента

**При записи на занятие**:
- Проверяется наличие активного абонемента
- `lessons_remaining` уменьшается на 1
- Если `lessons_remaining = 0` → `status` = `completed`, `is_active` = 0

**Проверка истечения срока**:
- Автоматически (через cron или при запросе)
- Если `valid_until < now` → `status` = `expired`, `is_active` = 0

## API Endpoints

### Для клиентов

- `POST /api/subscriptions` - Создать заявку
- `GET /api/subscriptions/my` - Мои абонементы
- `GET /api/subscriptions/active` - Активные абонементы

### Для администраторов

- `GET /api/subscriptions/requests` - Все заявки
- `POST /api/subscriptions/:id/approve` - Подтвердить
- `POST /api/subscriptions/:id/reject` - Отклонить

## Структура данных в БД

```sql
CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subscription_type_id INTEGER NOT NULL,
    lessons_remaining INTEGER NOT NULL,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    booking_type TEXT DEFAULT 'flexible',
    auto_direction TEXT,
    auto_weekdays TEXT,
    address TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    is_active INTEGER DEFAULT 0,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Уведомления

### При подтверждении
Отправляется Telegram-уведомление:
```
✅ Ваш абонемент подтвержден!

{Название абонемента}
Занятий: {lessons_remaining}
Действителен до: {valid_until}
Адрес: {address}

Теперь вы можете записываться на занятия!
```

### При отклонении
```
❌ Ваша заявка на абонемент отклонена

Причина: {rejection_reason}

Пожалуйста, свяжитесь с нами для уточнения деталей.
```

## Интеграция с личным кабинетом

В личном кабинете отображаются:
1. **Активные абонементы** - `status = confirmed`, `is_active = 1`
2. **Ожидающие подтверждения** - `status = pending`
3. **История** - все остальные статусы

Для каждого абонемента показывается:
- Прогресс-бар использования занятий
- Дата окончания с подсветкой (если истекает скоро)
- Статус с иконкой

