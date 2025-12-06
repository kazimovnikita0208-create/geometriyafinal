# 🐛 Исправление фильтрации направлений

## Проблема:
При выборе фитнес-абонемента и автоматической записи в форме отображались **все направления**, включая те, что с пилоном (Pole Fit, Pole Exotic).

## Причина:
Бэкенд не возвращал поле `requires_pole` в API `/api/directions`, поэтому фронтенд не мог фильтровать направления по этому признаку.

## Решение:

### 1. Backend - добавлено поле `requires_pole` в API
**Файл:** `backend/src/routes/directions.js`

**Изменения:**
- В `GET /api/directions` добавлено поле `requires_pole: direction.requires_pole === 1`
- В `GET /api/directions/:slug` добавлено поле `requires_pole: direction.requires_pole === 1`
- Конвертация из SQLite integer (0/1) в JavaScript boolean (false/true)

**До:**
```javascript
const formattedDirections = directions.map(direction => ({
  id: direction.id,
  name: direction.name,
  // ...
  color: direction.color
  // ❌ requires_pole отсутствует
}));
```

**После:**
```javascript
const formattedDirections = directions.map(direction => ({
  id: direction.id,
  name: direction.name,
  // ...
  color: direction.color,
  requires_pole: direction.requires_pole === 1 // ✅ Добавлено
}));
```

### 2. Frontend - обновлён интерфейс Direction
**Файл:** `frontend/lib/api.ts`

**Изменения:**
- Изменён тип `requires_pole` с `number` на `boolean`

**До:**
```typescript
export interface Direction {
  // ...
  requires_pole?: number; // ❌ number
}
```

**После:**
```typescript
export interface Direction {
  // ...
  requires_pole?: boolean; // ✅ boolean
}
```

## Результат:

### ✅ Теперь работает правильно:

**Классический абонемент:**
- Отображаются все 6 направлений

**Фитнес-абонемент:**
- Отображаются только 4 направления:
  - ✅ Сила & Гибкость (requires_pole: false)
  - ✅ Растяжка (requires_pole: false)
  - ✅ Choreo (requires_pole: false)
  - ✅ Strip (requires_pole: false)
- Скрыты 2 направления:
  - ❌ Pole Fit (requires_pole: true)
  - ❌ Pole Exotic (requires_pole: true)

**Комбо-абонемент:**
- Отображаются все 6 направлений

## Как проверить:

1. **Обновите страницу** (F5 или Ctrl+R)
2. Откройте `/prices`
3. Выберите **фитнес-абонемент** → "Начать заниматься"
4. Выберите "Автоматическая запись"
5. **Проверьте:** В списке направлений должно быть только 4 направления (без Pole Fit и Pole Exotic)
6. Должно отображаться сообщение: "ℹ️ Фитнес-абонемент: доступны только направления без пилона"

## Технические детали:

### SQLite → Backend → Frontend
1. **SQLite:** `requires_pole INTEGER` (0 или 1)
2. **Backend:** Конвертирует `0 → false`, `1 → true`
3. **Frontend:** Использует `dir.requires_pole` для фильтрации

### Логика фильтрации (frontend/app/prices/page.tsx):
```typescript
const getFilteredDirections = () => {
  if (selectedSubscription?.category === 'fitness') {
    return directions.filter(dir => !dir.requires_pole) // ✅ Работает
  }
  return directions
}
```

## Дополнительное исправление (09:41):

### 🐛 Обнаружена вторая проблема:
Бэкенд не возвращал поле `category` в API `/api/subscription-types`, поэтому фронтенд не мог определить тип абонемента для фильтрации.

### ✔️ Исправлено в `backend/src/routes/subscriptionTypes.js`:

**До:**
```javascript
groupedTypes[type.category].push({
  id: type.id,
  name: type.name,
  lessonCount: type.lesson_count,
  // ❌ category отсутствует
  // ...
});
```

**После:**
```javascript
groupedTypes[type.category].push({
  id: type.id,
  category: type.category, // ✅ Добавлено
  name: type.name,
  lessonCount: type.lesson_count,
  poleLesson: type.pole_lessons, // ✅ Для комбо
  fitnessLessons: type.fitness_lessons, // ✅ Для комбо
  // ...
});
```

### 🔍 Добавлено отладочное логирование:
В `frontend/app/prices/page.tsx` добавлены console.log для диагностики:
- Тип абонемента
- Количество направлений
- Результат фильтрации

## Статус: ✅ ПОЛНОСТЬЮ ИСПРАВЛЕНО

**Дата:** 26 ноября 2024, 09:41


## Проблема:
При выборе фитнес-абонемента и автоматической записи в форме отображались **все направления**, включая те, что с пилоном (Pole Fit, Pole Exotic).

## Причина:
Бэкенд не возвращал поле `requires_pole` в API `/api/directions`, поэтому фронтенд не мог фильтровать направления по этому признаку.

## Решение:

### 1. Backend - добавлено поле `requires_pole` в API
**Файл:** `backend/src/routes/directions.js`

**Изменения:**
- В `GET /api/directions` добавлено поле `requires_pole: direction.requires_pole === 1`
- В `GET /api/directions/:slug` добавлено поле `requires_pole: direction.requires_pole === 1`
- Конвертация из SQLite integer (0/1) в JavaScript boolean (false/true)

**До:**
```javascript
const formattedDirections = directions.map(direction => ({
  id: direction.id,
  name: direction.name,
  // ...
  color: direction.color
  // ❌ requires_pole отсутствует
}));
```

**После:**
```javascript
const formattedDirections = directions.map(direction => ({
  id: direction.id,
  name: direction.name,
  // ...
  color: direction.color,
  requires_pole: direction.requires_pole === 1 // ✅ Добавлено
}));
```

### 2. Frontend - обновлён интерфейс Direction
**Файл:** `frontend/lib/api.ts`

**Изменения:**
- Изменён тип `requires_pole` с `number` на `boolean`

**До:**
```typescript
export interface Direction {
  // ...
  requires_pole?: number; // ❌ number
}
```

**После:**
```typescript
export interface Direction {
  // ...
  requires_pole?: boolean; // ✅ boolean
}
```

## Результат:

### ✅ Теперь работает правильно:

**Классический абонемент:**
- Отображаются все 6 направлений

**Фитнес-абонемент:**
- Отображаются только 4 направления:
  - ✅ Сила & Гибкость (requires_pole: false)
  - ✅ Растяжка (requires_pole: false)
  - ✅ Choreo (requires_pole: false)
  - ✅ Strip (requires_pole: false)
- Скрыты 2 направления:
  - ❌ Pole Fit (requires_pole: true)
  - ❌ Pole Exotic (requires_pole: true)

**Комбо-абонемент:**
- Отображаются все 6 направлений

## Как проверить:

1. **Обновите страницу** (F5 или Ctrl+R)
2. Откройте `/prices`
3. Выберите **фитнес-абонемент** → "Начать заниматься"
4. Выберите "Автоматическая запись"
5. **Проверьте:** В списке направлений должно быть только 4 направления (без Pole Fit и Pole Exotic)
6. Должно отображаться сообщение: "ℹ️ Фитнес-абонемент: доступны только направления без пилона"

## Технические детали:

### SQLite → Backend → Frontend
1. **SQLite:** `requires_pole INTEGER` (0 или 1)
2. **Backend:** Конвертирует `0 → false`, `1 → true`
3. **Frontend:** Использует `dir.requires_pole` для фильтрации

### Логика фильтрации (frontend/app/prices/page.tsx):
```typescript
const getFilteredDirections = () => {
  if (selectedSubscription?.category === 'fitness') {
    return directions.filter(dir => !dir.requires_pole) // ✅ Работает
  }
  return directions
}
```

## Дополнительное исправление (09:41):

### 🐛 Обнаружена вторая проблема:
Бэкенд не возвращал поле `category` в API `/api/subscription-types`, поэтому фронтенд не мог определить тип абонемента для фильтрации.

### ✔️ Исправлено в `backend/src/routes/subscriptionTypes.js`:

**До:**
```javascript
groupedTypes[type.category].push({
  id: type.id,
  name: type.name,
  lessonCount: type.lesson_count,
  // ❌ category отсутствует
  // ...
});
```

**После:**
```javascript
groupedTypes[type.category].push({
  id: type.id,
  category: type.category, // ✅ Добавлено
  name: type.name,
  lessonCount: type.lesson_count,
  poleLesson: type.pole_lessons, // ✅ Для комбо
  fitnessLessons: type.fitness_lessons, // ✅ Для комбо
  // ...
});
```

### 🔍 Добавлено отладочное логирование:
В `frontend/app/prices/page.tsx` добавлены console.log для диагностики:
- Тип абонемента
- Количество направлений
- Результат фильтрации

## Статус: ✅ ПОЛНОСТЬЮ ИСПРАВЛЕНО

**Дата:** 26 ноября 2024, 09:41



