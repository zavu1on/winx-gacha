# План реализации — Winx Gacha

Пошаговые задачи для AI-агента. Каждый таск — атомарная единица работы с чёткими критериями завершённости.
Задачи выполняются строго по порядку (каждая фаза зависит от предыдущей).

Документы-источники:
- Механика гачи → `docs/GACHA_MECHANICS.md`
- Каталог айтемов → `docs/ITEMS.md`
- Технический стек → `docs/TECH_STACK.md`
- Архитектура → `docs/ARCHITECTURE.md`

---

## ФАЗА 1: Инициализация проекта

### Task 1.1 — Scaffold проекта

Рабочая директория: `/home/mikhail/projects/winx-gatcha/`

```bash
npm create vite@latest . -- --template react-ts
```

После создания — очистить шаблонный контент:
- Удалить `src/App.css`
- Удалить `src/assets/react.svg`
- Очистить содержимое `src/App.tsx` (оставить пустой компонент `export default function App() { return null }`)
- Очистить `src/index.css`

**Критерий:** `npm run dev` запускает пустую страницу без ошибок в консоли.

---

### Task 1.2 — Установка зависимостей

```bash
npm install gsap framer-motion zustand zod react-lottie-player react-router
npm install -D tailwindcss @tailwindcss/vite
```

Версии точные из `docs/TECH_STACK.md`.

**Критерий:** `npm install` завершается без ошибок, зависимости появляются в `package.json`.

---

### Task 1.3 — Инициализация shadcn/ui

```bash
npx shadcn@latest init
```

Параметры интерактивного диалога:
- Style: **Default**
- Base color: **Neutral**
- CSS variables: **Yes**

После инициализации установить компоненты:
```bash
npx shadcn@latest add button card badge tabs sheet dialog scroll-area
```

**Критерий:** директория `src/components/ui/` содержит нужные компоненты.

---

### Task 1.4 — Настройка Tailwind v4

В `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

В `src/index.css` (полностью заменить содержимое):
```css
@import "tailwindcss";

:root {
  --color-bg: #0d0a1a;
  --color-surface: #1a1033;
  --color-primary: #c84bff;
  --color-secondary: #ff69b4;
  --color-gold: #ffd700;
  --color-rare: #a78bfa;
  --color-common: #6b7280;
  --color-text: #f0e6ff;
  --color-muted: #8b7aa8;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: 'Inter', sans-serif;
}
```

В `index.html` добавить в `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

**Критерий:** классы Tailwind применяются, CSS-переменные доступны в компонентах.

---

### Task 1.5 — Настройка TypeScript paths

В `tsconfig.json` добавить:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Критерий:** `import { X } from '@/components/...'` резолвится без ошибок.

---

## ФАЗА 2: Типы и данные

### Task 2.1 — Типы (`src/types/index.ts`)

Создать файл с типами точно по `docs/ARCHITECTURE.md` раздел «Типы данных»:

```typescript
export type Rarity = 'common' | 'rare' | 'legendary'
export type ItemType = 'character' | 'outfit' | 'accessory' | 'common'

export interface GameItem {
  id: string
  name: string
  nameRu: string
  rarity: Rarity
  type: ItemType
  characterId?: string
  svgPath: string
  lottiePath?: string
  description: string
  color: string
}

export interface Character extends GameItem {
  type: 'character'
  element: string
  planet: string
}

export interface PullResult {
  item: GameItem
  isDuplicate: boolean
}
```

---

### Task 2.2 — Каталог персонажей (`src/data/characters.ts`)

Создать массив `CHARACTERS: Character[]` с 14 записями на основе таблицы из `docs/ITEMS.md` раздел «Legendary».

Для каждого персонажа:
- `id` — из колонки ID таблицы
- `svgPath` — `/assets/characters/{id}.svg`
- `rarity: 'legendary'`
- `type: 'character'`
- `color` — hex из таблицы
- `element`, `planet` — из таблицы
- `nameRu` — русское имя из таблицы

Экспортировать: `export const CHARACTERS: Character[]`

---

### Task 2.3 — Каталог предметов (`src/data/items.ts`)

Создать три массива на основе `docs/ITEMS.md`:

1. `OUTFITS: GameItem[]` — 36 нарядов (6 персонажей × 6 форм)
   - ID по схеме `outfit_{characterId}_{form}`
   - `rarity: 'rare'`, `type: 'outfit'`
   - `characterId` — ID персонажа
   - `svgPath` — `/assets/items/outfit_{characterId}_{form}.svg`

2. `ACCESSORIES: GameItem[]` — 16 аксессуаров из таблицы `docs/ITEMS.md`
   - `rarity: 'rare'`, `type: 'accessory'`
   - `characterId` — ID персонажа-владельца

3. `COMMONS: GameItem[]` — 20 обычных предметов из таблицы `docs/ITEMS.md`
   - `rarity: 'common'`, `type: 'common'`
   - `svgPath` — `/assets/items/{id}.svg`

Специальный предмет:
```typescript
export const STAR_POWER_ITEM: GameItem = {
  id: 'star_power',
  name: 'Star Power',
  nameRu: 'Звёздочка силы',
  rarity: 'rare',
  type: 'common',
  svgPath: '/assets/items/star_power.svg',
  description: 'Получается при выпадении персонажа, которого уже открыли',
  color: '#ffd700',
}
```

Экспортировать:
```typescript
export const ALL_RARE_ITEMS = [...OUTFITS, ...ACCESSORIES]
export const ALL_ITEMS = [...OUTFITS, ...ACCESSORIES, ...COMMONS]
```

---

### Task 2.4 — SVG-заглушки

Создать директории:
- `src/assets/characters/`
- `src/assets/items/`
- `src/assets/lottie/`

Для каждого из 14 персонажей создать SVG-заглушку `src/assets/characters/{id}.svg`:

```svg
<!-- Пример для bloom.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <rect width="200" height="300" fill="#ff4500" opacity="0.15" rx="12"/>
  <circle cx="100" cy="90" r="50" fill="#ff4500" opacity="0.7"/>
  <rect x="60" y="150" width="80" height="120" fill="#ff4500" opacity="0.5" rx="8"/>
  <text x="100" y="270" text-anchor="middle" fill="#ff4500" font-size="14" font-family="sans-serif">Блум</text>
</svg>
```

Цвет берётся из `color` поля персонажа. Буквы в кружке — первые 2 буквы имени.

Для предметов создать минимальные SVG-иконки (40×40, цветной круг + буква).

**Критерий:** все SVG-файлы существуют и не вызывают ошибок 404 при загрузке.

---

## ФАЗА 3: State Management

### Task 3.1 — Zod-схемы (`src/lib/schemas.ts`)

```typescript
import { z } from 'zod'

export const GameStateSchema = z.object({
  pullsAvailable: z.number().min(0).max(40),
  lastRefillDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pityRare: z.number().min(0).max(9),
  pityLegendary: z.number().min(0).max(119),
})

export const InventorySchema = z.object({
  unlockedCharacterIds: z.array(z.string()),
  ownedItemIds: z.array(z.string()),
  equipment: z.record(
    z.object({
      outfitId: z.string().nullable(),
      accessoryIds: z.array(z.string()),
    })
  ),
  recentDropIds: z.array(z.string()),
})

export type GameStateData = z.infer<typeof GameStateSchema>
export type InventoryData = z.infer<typeof InventorySchema>
```

---

### Task 3.2 — gameStore (`src/store/gameStore.ts`)

Zustand store с persist middleware. Ключ хранения: `winx_game`.

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getDailyRefill } from '@/lib/dailyRefill'

interface GameStore {
  pullsAvailable: number
  lastRefillDate: string
  pityRare: number
  pityLegendary: number

  consumePull: () => void
  consumePulls: (n: number) => void
  updatePity: (rarity: 'common' | 'rare' | 'legendary') => void
  refillIfNewDay: () => void
}

const DEFAULT_STATE = {
  pullsAvailable: 10,
  lastRefillDate: new Date().toISOString().split('T')[0],
  pityRare: 0,
  pityLegendary: 0,
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      consumePull: () => {
        const { pullsAvailable } = get()
        if (pullsAvailable <= 0) throw new Error('No pulls available')
        set({ pullsAvailable: pullsAvailable - 1 })
      },

      consumePulls: (n) => {
        const { pullsAvailable } = get()
        if (pullsAvailable < n) throw new Error('Not enough pulls')
        set({ pullsAvailable: pullsAvailable - n })
      },

      updatePity: (rarity) => {
        const { pityRare, pityLegendary } = get()
        if (rarity === 'legendary') {
          set({ pityRare: 0, pityLegendary: 0 })
        } else if (rarity === 'rare') {
          set({ pityRare: 0, pityLegendary: pityLegendary + 1 })
        } else {
          set({ pityRare: pityRare + 1, pityLegendary: pityLegendary + 1 })
        }
      },

      refillIfNewDay: () => {
        const state = get()
        const refill = getDailyRefill(
          state.pullsAvailable,
          state.lastRefillDate,
          10,
          40
        )
        if (refill) set(refill)
      },
    }),
    { name: 'winx_game' }
  )
)
```

**Важно:** pity обновляется в `updatePity`, а не в алгоритме пулла — store является единственным источником истины для pity-счётчиков.

---

### Task 3.3 — inventoryStore (`src/store/inventoryStore.ts`)

Zustand store с persist. Ключ хранения: `winx_inventory`.

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CharacterEquipment {
  outfitId: string | null
  accessoryIds: string[]
}

interface InventoryStore {
  unlockedCharacterIds: string[]
  ownedItemIds: string[]
  equipment: Record<string, CharacterEquipment>
  recentDropIds: string[]

  unlockCharacter: (characterId: string) => void
  addItem: (itemId: string) => void
  addRecentDrop: (itemId: string) => void
  equipOutfit: (characterId: string, outfitId: string | null) => void
  addAccessory: (characterId: string, accessoryId: string) => void
  removeAccessory: (characterId: string, accessoryId: string) => void
  isCharacterUnlocked: (characterId: string) => boolean
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      unlockedCharacterIds: [],
      ownedItemIds: [],
      equipment: {},
      recentDropIds: [],

      unlockCharacter: (characterId) =>
        set((s) => ({
          unlockedCharacterIds: [...s.unlockedCharacterIds, characterId],
        })),

      addItem: (itemId) =>
        set((s) => ({ ownedItemIds: [...s.ownedItemIds, itemId] })),

      addRecentDrop: (itemId) =>
        set((s) => ({
          recentDropIds: [itemId, ...s.recentDropIds].slice(0, 10),
        })),

      equipOutfit: (characterId, outfitId) =>
        set((s) => ({
          equipment: {
            ...s.equipment,
            [characterId]: {
              outfitId,
              accessoryIds: s.equipment[characterId]?.accessoryIds ?? [],
            },
          },
        })),

      addAccessory: (characterId, accessoryId) =>
        set((s) => {
          const current = s.equipment[characterId]?.accessoryIds ?? []
          if (current.length >= 3 || current.includes(accessoryId)) return s
          return {
            equipment: {
              ...s.equipment,
              [characterId]: {
                outfitId: s.equipment[characterId]?.outfitId ?? null,
                accessoryIds: [...current, accessoryId],
              },
            },
          }
        }),

      removeAccessory: (characterId, accessoryId) =>
        set((s) => ({
          equipment: {
            ...s.equipment,
            [characterId]: {
              outfitId: s.equipment[characterId]?.outfitId ?? null,
              accessoryIds: (s.equipment[characterId]?.accessoryIds ?? [])
                .filter((id) => id !== accessoryId),
            },
          },
        })),

      isCharacterUnlocked: (characterId) =>
        get().unlockedCharacterIds.includes(characterId),
    }),
    { name: 'winx_inventory' }
  )
)
```

---

### Task 3.4 — Инициализация (`src/lib/storage.ts` + `src/lib/dailyRefill.ts`)

**`src/lib/dailyRefill.ts`:**
```typescript
export function getDailyRefill(
  pullsAvailable: number,
  lastRefillDate: string,
  maxDailyPulls: number,
  maxAccumulated: number
): { pullsAvailable: number; lastRefillDate: string } | null {
  const today = new Date().toISOString().split('T')[0]
  if (lastRefillDate === today) return null
  return {
    pullsAvailable: Math.min(pullsAvailable + maxDailyPulls, maxAccumulated),
    lastRefillDate: today,
  }
}
```

**`src/lib/storage.ts`:**
```typescript
import { GameStateSchema, InventorySchema } from './schemas'
import { useGameStore } from '@/store/gameStore'

export function initializeApp() {
  // Валидация gameStore
  const rawGame = localStorage.getItem('winx_game')
  if (rawGame) {
    try {
      const parsed = GameStateSchema.safeParse(JSON.parse(rawGame))
      if (!parsed.success) localStorage.removeItem('winx_game')
    } catch {
      localStorage.removeItem('winx_game')
    }
  }

  // Валидация inventoryStore
  const rawInv = localStorage.getItem('winx_inventory')
  if (rawInv) {
    try {
      const parsed = InventorySchema.safeParse(JSON.parse(rawInv))
      if (!parsed.success) localStorage.removeItem('winx_inventory')
    } catch {
      localStorage.removeItem('winx_inventory')
    }
  }

  // Ежедневное пополнение
  useGameStore.getState().refillIfNewDay()
}
```

Вызвать в `src/main.tsx` до `ReactDOM.createRoot(...).render(...)`.

---

## ФАЗА 4: Алгоритм гачи

### Task 4.1 — Алгоритм пулла (`src/lib/gacha.ts`)

Реализовать по алгоритму из `docs/GACHA_MECHANICS.md` и псевдокоду из `docs/ARCHITECTURE.md`.

Функции:
- `computeLegendaryRate(pityLegendary: number): number`
- `computeRareRate(pityRare: number): number`
- `singlePull(pityRare, pityLegendary): { rarity, newPityRare, newPityLegendary }`
- `pickItem(rarity, allItems): GameItem` — случайный айтем из соответствующего пула
- `executePulls(count, initialPityRare, initialPityLegendary): PullResult[]`

В `executePulls`:
1. Учитывать гарантию x10 (последний пулл → Rare если не было Rare/Legendary)
2. Для Legendary — проверить через `inventoryStore.isCharacterUnlocked()` на дубликат
3. Если дубликат — вернуть `STAR_POWER_ITEM` вместо персонажа

**Критерий:** unit-тест (можно в консоли): 1000 пуллов → pityRare не превышает 10, pityLegendary не превышает 120.

---

## ФАЗА 5: Роутинг и Layout

### Task 5.1 — main.tsx и App.tsx

**`src/main.tsx`:**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import { initializeApp } from './lib/storage'
import './index.css'

initializeApp()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

**`src/App.tsx`:**
```typescript
import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PullPage from './pages/PullPage'
import RosterPage from './pages/RosterPage'
import CharacterPage from './pages/CharacterPage'
import CollectionPage from './pages/CollectionPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="pull" element={<PullPage />} />
        <Route path="roster" element={<RosterPage />} />
        <Route path="character/:id" element={<CharacterPage />} />
        <Route path="collection" element={<CollectionPage />} />
      </Route>
    </Routes>
  )
}
```

---

### Task 5.2 — Layout (`src/components/Layout.tsx`)

```
Структура:
  <div className="min-h-screen flex flex-col">
    <header> <!-- фиксированный, z-50 -->
      <nav> <!-- лого + ссылки: «Главная», «Ростер», «Коллекция» + PullsCounter -->
    </header>
    <main className="flex-1 pt-16"> <!-- pt для хедера -->
      <Outlet />
    </main>
  </div>
```

PullsCounter: иконка ✦ + `{pullsAvailable}/40` из `useGameStore`.
Активная ссылка в nav подсвечивается через `NavLink` с `isActive`.

---

## ФАЗА 6: Страницы

### Task 6.1 — HomePage (`src/pages/HomePage.tsx`)

Элементы:
1. Заголовок «Winx Gacha» (шрифт Cinzel, крупный)
2. Subtitle «Открой своих любимых персонажей»
3. Счётчик: прогресс-бар `pullsAvailable / 40` + текст «X прокруток»
4. Две кнопки: «Открыть ×1» и «Открыть ×10»
   - `disabled` если недостаточно прокруток
   - Клик: `executePulls(n)` → `consumePulls(n)` → `navigate('/pull', { state: { results } })`
   - Каждый item из results добавить в `inventoryStore` (unlockCharacter или addItem) + addRecentDrop
5. Секция «Последние выпадения» — горизонтальный скролл 5 последних из `recentDropIds`

---

### Task 6.2 — PullPage (`src/pages/PullPage.tsx`)

```typescript
// Получить results из location.state
// Если state пустой (прямой переход) — redirect на '/'
// Рендер: <CardRevealSequence results={results} />
// После завершения анимации: кнопки «Ещё раз» (→ '/') и «В ростер» (→ '/roster')
```

---

### Task 6.3 — CardRevealSequence (`src/components/CardReveal/CardRevealSequence.tsx`)

Компонент управляет GSAP-анимацией для массива карточек.

Для x1: одна карточка, автоматически переворачивается через 0.5s.
Для x10: 10 карточек стопкой, переворачиваются по клику (одна за раз, слева направо).

При флипе Legendary — показать `LegendaryReveal` (отдельный оверлей поверх):
- Затемнение → золотая вспышка → SVG персонажа влетает снизу → Lottie частицы → имя

При флипе Rare — короткая серебряная вспышка (GSAP `to` на overlay).

Компонент `CardReveal` (`src/components/CardReveal/CardReveal.tsx`):
- Props: `item: GameItem`, `isFlipped: boolean`, `onClick: () => void`
- Фронт: цветной фон `item.color`, SVG-иконка, `nameRu`, rarity badge
- Бэк: тёмный фон, логотип/паттерн

---

### Task 6.4 — RosterPage (`src/pages/RosterPage.tsx`)

```
- Заголовок «Ростер» + счётчик «X / 14 открыто»
- CSS Grid: 2 колонки на мобиле, 3 на планшете, 4 на десктопе
- Для каждого персонажа из CHARACTERS:
  - unlocked: цветная карточка с SVG + имя + element + планета
  - locked: тёмная карточка с серым силуэтом + «???»
- Клик на unlocked → navigate('/character/:id')
- Framer Motion stagger-анимация при монтировании (карточки появляются с задержкой)
```

---

### Task 6.5 — CharacterPage (`src/pages/CharacterPage.tsx`)

```
- useParams() → id
- Если персонаж не найден или не открыт → redirect на '/roster'

Layout (вертикальный на мобиле, горизонтальный на десктопе):

  Левая панель (или верх):
    <CharacterViewer characterId={id} />
      - Большой SVG персонажа (200×300 или больше)
      - Оверлей outfit SVG (opacity/visibility переключается)
      - Framer Motion animate при смене outfit (key prop)
    Имя + element + планета

  Правая панель (или низ):
    <OutfitPicker characterId={id} />
      - Горизонтальная карусель нарядов только для данного персонажа
      - Только разблокированные наряды из ownedItemIds
      - Выбранный наряд — обводка gold
      - Клик: equipOutfit(id, outfitId)
      - Кнопка «Снять наряд» → equipOutfit(id, null)

    <AccessoryPicker characterId={id} />
      - 3 слота (пустые или заполненные)
      - Список разблокированных аксессуаров для персонажа
      - Клик по пустому слоту → выбор аксессуара (Dialog/Sheet)
      - Клик по заполненному → снять
```

---

### Task 6.6 — CollectionPage (`src/pages/CollectionPage.tsx`)

```
- Tabs: «Все» | «Персонажи» | «Наряды» | «Аксессуары» | «Обычные»
- Счётчик «X / Y получено» для активной вкладки
- ItemGrid: responsive grid с ItemCard для каждого уникального предмета из ownedItemIds
  ItemCard: SVG-иконка (40×40), nameRu, rarity badge (цвет по редкости), кол-во если > 1
- Персонажи: только из unlockedCharacterIds
```

---

## ФАЗА 7: Визуальный polish

### Task 7.1 — Page transitions

Обернуть в `src/App.tsx` весь `<Routes>` в `<AnimatePresence mode="wait">`.

В каждой странице добавить:
```typescript
import { motion } from 'framer-motion'

// Обернуть return в:
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.25 }}
>
  {/* контент страницы */}
</motion.div>
```

PullPage: `y: 40` для более драматичного входа.

---

### Task 7.2 — Lottie-анимации

Скачать free Lottie-анимации с [lottiefiles.com](https://lottiefiles.com) (keyword: "sparkle", "stars", "golden particles") и сохранить в `src/assets/lottie/`:
- `legendary_particles.json` — золотые частицы/звёздочки
- `rare_sparkle.json` — серебряное мерцание

Если скачать нельзя — создать минимальный Lottie JSON вручную (простые анимированные круги).

Использование в `LegendaryReveal`:
```typescript
import Lottie from 'react-lottie-player'
import legendaryParticles from '@/assets/lottie/legendary_particles.json'

<Lottie
  loop={false}
  play={isPlaying}
  animationData={legendaryParticles}
  style={{ position: 'absolute', width: '100%', height: '100%' }}
/>
```

---

### Task 7.3 — Hover-эффекты кнопок

PullButton с Framer Motion:
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

CharacterCard в RosterPage:
```typescript
<motion.div whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(200,75,255,0.4)' }}>
```

---

## ФАЗА 8: Финальные проверки

### Task 8.1 — Проверка pity вручную

```
1. Открыть DevTools → Application → Local Storage
2. Отредактировать winx_game: { "pityRare": 9, ... }
3. Нажать «Открыть ×1»
4. Ожидание: выпадает Rare или Legendary
5. Проверить: pityRare сбросился в 0

6. Отредактировать: { "pityLegendary": 119, ... }
7. Нажать «Открыть ×1»
8. Ожидание: выпадает Legendary
9. Проверить: оба pity = 0
```

### Task 8.2 — Проверка x10 гарантии

```
1. Установить pityRare: 0, pityLegendary: 0
2. Если нужно — временно изменить вероятности для теста (rare rate → 0)
3. Нажать «Открыть ×10»
4. Ожидание: среди 10 результатов хотя бы 1 Rare или Legendary
```

### Task 8.3 — Проверка ежедневного пополнения

```
1. Установить lastRefillDate: '2020-01-01'
2. Обновить страницу
3. Ожидание: pullsAvailable увеличился на 10 (не превышая 40)
4. Установить pullsAvailable: 35, lastRefillDate: '2020-01-01'
5. Обновить страницу
6. Ожидание: pullsAvailable = 40 (не больше максимума)
```

### Task 8.4 — Проверка кастомизации

```
1. Разблокировать персонажа (например, через DevTools выставить unlockedCharacterIds: ['bloom'])
2. Добавить наряд в ownedItemIds: ['outfit_bloom_enchantix']
3. Перейти на /character/bloom
4. Кликнуть на Enchantix в OutfitPicker
5. Ожидание: SVG обновился
6. Проверить: equipment['bloom'].outfitId === 'outfit_bloom_enchantix'
```

### Task 8.5 — Проверка дубликата

```
1. Выставить unlockedCharacterIds: ['bloom']
2. Временно изменить алгоритм чтобы следующий пулл гарантированно дал Legendary Блум
3. Выполнить пулл
4. Ожидание: в результатах — 'star_power', а не повторный 'bloom'
5. Ожидание: unlockedCharacterIds не изменился (Блум не добавлен дважды)
```

### Task 8.6 — TypeScript

```bash
npx tsc --noEmit
```

**Критерий:** 0 ошибок.

### Task 8.7 — Responsive

Проверить в DevTools Device Toolbar:
- **375px** (iPhone SE): 2 колонки в ростере, кнопки стекаются вертикально
- **768px** (iPad): 3 колонки в ростере
- **1280px** (Desktop): 4 колонки в ростере, горизонтальный layout на CharacterPage

### Task 8.8 — Финальная сборка

```bash
npm run build
```

**Критерий:** успешная сборка, никаких предупреждений о chunk size > 1MB.
