# Технический стек — Winx Gacha

## Обзор

```
React 19 + TypeScript + Vite 6
├── Routing:     React Router v7
├── State:       Zustand 5 + zustand/middleware (persist)
├── Animation:   GSAP 3 (reveal-последовательности) + Framer Motion 12 (UI-переходы)
├── UI:          Tailwind CSS v4 + shadcn/ui
├── Characters:  SVG-иллюстрации + react-lottie-player (частицы, эффекты)
└── Validation:  Zod (схема localStorage при загрузке)
```

## Зависимости

### package.json (production)

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "zustand": "^5.0.0",
    "gsap": "^3.12.0",
    "framer-motion": "^12.0.0",
    "zod": "^3.23.0",
    "react-lottie-player": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

### shadcn/ui

Устанавливается отдельно через CLI (`npx shadcn@latest init`), не через npm напрямую.
Используемые компоненты: Button, Card, Badge, Tabs, Sheet, Dialog, ScrollArea.

## Обоснование выбора

### Анимация: GSAP + Framer Motion

**Зачем два инструмента:**

| Задача | Инструмент | Причина |
|--------|-----------|---------|
| Reveal-анимация карточек | **GSAP** | Timeline API — единственный способ оркестровать сложные последовательности: flip → вспышка → SVG-влет → частицы → typewriter. Framer Motion не имеет imperativного Timeline |
| Page transitions | **Framer Motion** | Декларативный `AnimatePresence` — идеален для монтирования/демонтирования страниц |
| Hover-эффекты кнопок | **Framer Motion** | `whileHover`, `whileTap` — лаконичны и читаемы |
| Смена наряда персонажа | **Framer Motion** | `animate` prop с `key` для fade-transition |

### UI: Tailwind CSS v4 + shadcn/ui

- **Tailwind v4** — атомарный CSS, не диктует визуальный стиль, возможна полная кастомизация fantasy-темы через CSS-переменные
- **shadcn/ui** — headless компоненты (код копируется в проект), полная свобода кастомизации в отличие от MUI или Chakra, которые навязывают Material/Chakra эстетику
- Альтернативы отклонены: MUI (слишком Material Design), Chakra UI (менее гибкая тема), plain Tailwind (больше работы по компонентам)

### State Management: Zustand + persist

- Минимальный boilerplate — весь store в одном файле
- Встроенный `persist` middleware автоматически сериализует/десериализует localStorage
- Не требует Provider (в отличие от Redux)
- Альтернатива Redux Toolkit избыточна для игры без серверного взаимодействия

### Персонажи: SVG + Lottie

- **SVG** — векторный формат, масштабируется без потерь, кастомизируется через CSS (смена цвета, наряда через `visibility`/`opacity` слоёв)
- **react-lottie-player** — JSON-анимации для эффектов (частицы при Legendary, мерцание при Rare). Не требует лицензий в отличие от Spine или Live2D
- Live2D/Spine отклонены: платные SDK, требуют специальных ассетов, избыточны для веб-игры

### Валидация: Zod

- Runtime-проверка данных из localStorage при старте приложения
- Защита от corrupt-данных (изменённый вручную JSON, обновление схемы между версиями)
- Если схема невалидна — сброс к дефолтным значениям вместо краша

## Конфигурация Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## Конфигурация TypeScript

```json
// tsconfig.json (ключевые поля)
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Цветовая тема

Определяется через CSS-переменные в `src/index.css`:

```css
:root {
  --color-bg: #0d0a1a;        /* глубокий тёмно-фиолетовый фон */
  --color-surface: #1a1033;   /* поверхности карточек */
  --color-primary: #c84bff;   /* акцентный пурпур */
  --color-secondary: #ff69b4; /* розовый */
  --color-gold: #ffd700;      /* Legendary */
  --color-rare: #a78bfa;      /* Rare (фиолетово-голубой) */
  --color-common: #6b7280;    /* Common (серый) */
  --color-text: #f0e6ff;      /* основной текст */
  --color-muted: #8b7aa8;     /* приглушённый текст */
}
```

## Шрифты

Подключить через Google Fonts в `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

- **Cinzel** — заголовки, имена персонажей, названия нарядов (serif, фэнтезийный)
- **Inter** — основной текст, счётчики, описания (sans-serif, читаемый)

## Структура проекта

```
winx-gatcha/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── characters/      # SVG-иллюстрации (bloom.svg, stella.svg, ...)
│   │   ├── items/           # SVG-иконки предметов
│   │   └── lottie/          # Lottie JSON-анимации
│   ├── components/
│   │   ├── ui/              # shadcn/ui компоненты
│   │   ├── CardReveal/      # компоненты анимации выпадения
│   │   ├── CharacterViewer/ # просмотр и кастомизация персонажа
│   │   ├── Layout.tsx
│   │   └── PullsCounter.tsx
│   ├── data/
│   │   ├── characters.ts    # каталог персонажей (из ITEMS.md)
│   │   └── items.ts         # каталог предметов (из ITEMS.md)
│   ├── lib/
│   │   ├── gacha.ts         # алгоритм пулла (из GACHA_MECHANICS.md)
│   │   ├── schemas.ts       # Zod-схемы
│   │   ├── storage.ts       # инициализация + валидация localStorage
│   │   └── dailyRefill.ts   # логика ежедневного пополнения
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── PullPage.tsx
│   │   ├── RosterPage.tsx
│   │   ├── CharacterPage.tsx
│   │   └── CollectionPage.tsx
│   ├── store/
│   │   ├── gameStore.ts
│   │   └── inventoryStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/                    # документация проекта
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
