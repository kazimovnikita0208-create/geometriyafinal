# 💜 Геометрия - Frontend (Next.js Mini App)

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)

**Современный Next.js frontend для Telegram Mini App студии танцев "Геометрия"**

[🚀 Demo](#demo) • [📦 Установка](#installation) • [🎨 Компоненты](#components) • [📱 Deploy](#deploy)

</div>

---

## ✨ Особенности

- 🎭 **Анимированный фон** - BeamsBackground с движущимися лучами
- 💜 **Градиентные кнопки** - премиум компоненты с CSS animations
- 🎨 **Фирменный стиль** - цвет #5833b6, фиолетовая тема
- 📱 **Адаптивный дизайн** - идеально на всех устройствах
- ⚡ **Optimized build** - 101 KB First Load JS
- 🔄 **Static Generation** - быстрая загрузка страниц
- 📲 **Telegram WebApp SDK** - полная интеграция

---

## 🛠️ Tech Stack

### Core
- **Next.js 14.2.33** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.x** - Type safety

### Styling
- **Tailwind CSS 3.4.1** - Utility-first CSS
- **PostCSS** - CSS processing
- **Custom animations** - Framer Motion & CSS

### Components
- **@radix-ui/react-slot** - Primitive components
- **class-variance-authority** - Component variants
- **clsx & tailwind-merge** - Conditional classes

### Tools
- **ESLint** - Code linting
- **Autoprefixer** - CSS vendor prefixes

---

## 🚀 Быстрый старт

### Требования
- Node.js 18.20.8 или выше
- npm или yarn

### 1. Установка

```bash
# Клонирование репозитория
git clone https://github.com/kazimovnikita0208-create/geometriyafront.git
cd geometriyafront

# Установка зависимостей
npm install
```

### 2. Разработка

```bash
# Запуск dev сервера
npm run dev

# Открыть http://localhost:3000
```

### 3. Production Build

```bash
# Сборка для production
npm run build

# Запуск production сервера
npm run start
```

---

## 📁 Структура проекта

```
geometriyafront/
├── app/                        # App Router (Next.js 14)
│   ├── page.tsx               # 🏠 Главная страница
│   ├── schedule/              # 📅 Расписание занятий
│   ├── directions/            # 💃 О направлениях
│   ├── prices/                # 💰 Цены и абонементы
│   ├── profile/               # 👤 Личный кабинет
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles + animations
│
├── components/
│   └── ui/
│       ├── beams-background.tsx    # ✨ Анимированный фон
│       └── gradient-button.tsx     # 🎨 Градиентные кнопки
│
├── lib/
│   └── utils.ts               # Utility functions (cn)
│
├── public/
│   └── logo.svg               # 💜 Логотип студии
│
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

---

## 🎨 Компоненты

### 1. BeamsBackground
Анимированный фон с движущимися фиолетовыми лучами.

```tsx
import { BeamsBackground } from '@/components/ui/beams-background'

<BeamsBackground intensity="medium">
  {/* Your content */}
</BeamsBackground>
```

**Props:**
- `intensity`: "subtle" | "medium" | "strong"
- `className`: string (optional)
- `children`: ReactNode

**Особенности:**
- 30+ анимированных лучей
- Canvas-based рендеринг
- Фиолетовая палитра (hue: 270-300)
- Оптимизировано для 60 FPS

### 2. GradientButton
Премиум кнопки с анимированным радиальным градиентом.

```tsx
import { GradientButton } from '@/components/ui/gradient-button'

<GradientButton onClick={handleClick}>
  Click me
</GradientButton>
```

**Props:**
- `variant`: "default" | "variant"
- `asChild`: boolean
- Standard button props

**Особенности:**
- CSS Custom Properties (@property)
- Плавные transitions (0.5s)
- Градиентная рамка
- Hover эффекты

---

## 🎨 Дизайн-система

### Цветовая палитра

```css
/* Основной цвет студии */
--brand-purple: #5833b6;

/* Градации фиолетового */
--purple-950: #1a0b2e;
--purple-900: #2d1b4e;
--purple-800: #4527a0;
--purple-600: #7e57c2;
--purple-400: #a855f7;
--purple-200: #e9d5ff;
```

### Анимации

```css
/* Fade In */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out backwards;
}

/* Float */
.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Shimmer */
.animate-shimmer {
  animation: shimmer 8s linear infinite;
}
```

### Typography

- **Заголовки**: Geist Sans, font-bold
- **Текст**: Geist Sans, font-normal
- **Моноширинный**: Geist Mono

---

## 📱 Страницы

### 🏠 Главная (`/`)
- Логотип студии
- 4 основные кнопки меню
- Анимированный фон
- Footer с контактами

### 📅 Расписание (`/schedule`)
- Список занятий
- Фильтры по залам
- Кнопка записи

### 💃 О направлениях (`/directions`)
- Pole Dance
- Растяжка
- Другие направления

### 💰 Цены (`/prices`)
- Типы абонементов
- Стоимость занятий
- Акции

### 👤 Личный кабинет (`/profile`)
- Активные абонементы
- История занятий
- Предстоящие занятия

---

## 🚀 Deploy

### Vercel (рекомендуется)

```bash
# Установка Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

**Автоматический deploy:**
1. Подключите репозиторий к Vercel
2. Push в main → автоматический deploy

### Netlify

```bash
# Установка Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build image
docker build -t geometriya-front .

# Run container
docker run -p 3000:3000 geometriya-front
```

---

## ⚙️ Environment Variables

Создайте `.env.local`:

```env
# Telegram Bot (optional)
NEXT_PUBLIC_BOT_USERNAME=your_bot_username

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_ga_id
```

---

## 📊 Production Build Results

```
Route (app)                              Size     First Load JS
┌ ○ /                                    13.5 kB         101 kB
├ ○ /directions                          1.54 kB        88.8 kB
├ ○ /prices                              1.67 kB        88.9 kB
├ ○ /profile                             1.84 kB        89.1 kB
└ ○ /schedule                            1.06 kB        88.3 kB

○  (Static)  prerendered as static content
```

**Итого:**
- ✅ Все страницы статические
- ✅ First Load: 101 KB (отлично!)
- ✅ Shared chunks: 87.2 KB
- ✅ Оптимизировано для CDN

---

## 🎯 Скрипты

```bash
# Development
npm run dev          # Запуск dev сервера (localhost:3000)

# Production
npm run build        # Сборка для production
npm run start        # Запуск production сервера

# Linting
npm run lint         # ESLint проверка
```

---

## 🔧 Кастомизация

### Изменить цветовую тему

В `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      brand: {
        purple: '#5833b6',  // Ваш цвет
        // ...
      }
    }
  }
}
```

### Изменить анимацию фона

В `components/ui/beams-background.tsx`:

```tsx
// Изменить цвет лучей
hue: 270 + Math.random() * 30,  // Фиолетовый (270-300)

// Изменить количество
const MINIMUM_BEAMS = 30;  // По умолчанию

// Изменить скорость
speed: 1.5 + Math.random() * 2.0,
```

---

## 📦 Зависимости

### Production
- `next@14.2.33`
- `react@18.2.0`
- `react-dom@18.2.0`
- `tailwindcss@3.4.1`
- `@radix-ui/react-slot@^1.1.1`
- `class-variance-authority@^0.7.1`
- `clsx@^2.1.1`
- `tailwind-merge@^2.5.5`

### Development
- `typescript@^5`
- `@types/node@^20`
- `@types/react@^18`
- `postcss@8.4.31`
- `autoprefixer@10.4.16`
- `eslint@^9`

---

## 🤝 Контакты

**Студия "Геометрия"**
- 📍 Волгина 117А
- 📍 Московское шоссе 43
- 📸 [@geometriya_dance](https://instagram.com/geometriya_dance)

---

## 📝 Лицензия

MIT License

---

## 🙏 Благодарности

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Vercel](https://vercel.com/)

---

<div align="center">

**Создано с 💜 для студии "Геометрия"**

[⬆ Наверх](#-геометрия---frontend-nextjs-mini-app)

</div>
