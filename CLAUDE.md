# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Winx Gacha — CSR web app (браузерный симулятор гачи по вселенной Winx). Все данные хранятся в localStorage. Серверной части нет.

## Commands

```bash
npm run dev        # dev-сервер (Vite, http://localhost:5173)
npm run build      # production-сборка в dist/
npm run preview    # превью production-сборки
npx tsc --noEmit   # type-check без сборки
```

Проект ещё не инициализирован. Перед работой выполнить фазы 1–2 из `docs/IMPLEMENTATION_PLAN.md`:
```bash
npm create vite@latest . -- --template react-ts
npm install gsap framer-motion zustand zod react-lottie-player react-router
npm install -D tailwindcss @tailwindcss/vite
npx shadcn@latest init   # Style: Default, Color: Neutral, CSS vars: Yes
npx shadcn@latest add button card badge tabs sheet dialog scroll-area
```

## Architecture

### Стек

- **React 19 + TypeScript + Vite 6** — основа
- **React Router v7** — роутинг (BrowserRouter, без server-side)
- **Zustand 5 + persist** — глобальный стейт → `localStorage`
- **GSAP 3** — оркестровка reveal-анимации карточек (Timeline API)
- **Framer Motion 12** — page transitions, hover-эффекты, smount-stagger
- **Tailwind CSS v4 + shadcn/ui** — UI; shadcn копируется в `src/components/ui/`
- **Zod** — валидация localStorage при старте
- **react-lottie-player** — Lottie-эффекты при Legendary/Rare

### Роуты

| Путь | Страница | Назначение |
|------|----------|-----------|
| `/` | `HomePage` | Кнопки пулла, счётчик, последние выпадения |
| `/pull` | `PullPage` | Анимация карточек (результаты через `location.state`) |
| `/roster` | `RosterPage` | Все 14 персонажей: открытые / закрытые силуэты |
| `/character/:id` | `CharacterPage` | Просмотр SVG + OutfitPicker + AccessoryPicker |
| `/collection` | `CollectionPage` | Инвентарь с табами по типу |

### State Management

Два Zustand-стора с `persist`:

**`gameStore`** (ключ `winx_game`):
- `pullsAvailable` (0–40), `lastRefillDate`, `pityRare` (0–9), `pityLegendary` (0–119)
- Экшены: `consumePull`, `consumePulls`, `updatePity`, `refillIfNewDay`

**`inventoryStore`** (ключ `winx_inventory`):
- `unlockedCharacterIds`, `ownedItemIds` (с дубликатами), `equipment` (outfit + до 3 аксессуаров per character), `recentDropIds` (последние 10)

При старте (`main.tsx` → `initializeApp()`): Zod-валидация обоих ключей localStorage → сброс при невалидных данных → `refillIfNewDay()`.

### Алгоритм гачи (`src/lib/gacha.ts`)

Soft pity:
- **Rare**: базовая 5.1%, растёт с пулла 7: `0.051 + 0.20*(n-6)`, hard pity на 10
- **Legendary**: базовая 0.6%, растёт с пулла 90: `0.006 + 0.066*(n-89)`, hard pity на 120

Особые правила:
- x10 пулл: если среди 10 не выпало Rare/Legendary — последний форсируется как Rare
- Дубликат Legendary (персонаж уже открыт) → выдаётся `STAR_POWER_ITEM` вместо персонажа
- `pityRare` сбрасывается при Rare **или** Legendary; `pityLegendary` — только при Legendary

### Данные

- `src/data/characters.ts` — 14 персонажей (`Character[]`, rarity: `legendary`)
- `src/data/items.ts` — наряды (36), аксессуары (16), обычные (20), `STAR_POWER_ITEM`
- `src/assets/characters/` — SVG-иллюстрации (`{id}.svg`, 200×300)
- `src/assets/items/` — SVG-иконки предметов (40×40)
- `src/assets/lottie/` — `legendary_particles.json`, `rare_sparkle.json`

### Компонентная структура ключевых фич

**PullPage / CardReveal:**
- `CardRevealSequence` (GSAP Timeline) → `CardReveal × N` (flip-анимация)
- При Legendary: `LegendaryReveal` оверлей (затемнение → вспышка → SVG влетает снизу → Lottie частицы → typewriter имени)
- При Rare: короткая серебряная вспышка через GSAP

**CharacterPage:**
- `CharacterViewer` — большой SVG + overlay для outfit (opacity toggle, Framer Motion при смене key)
- `OutfitPicker` — горизонтальная карусель только разблокированных нарядов персонажа
- `AccessoryPicker` — 3 слота, выбор через Dialog/Sheet

### Визуальная тема

CSS-переменные в `src/index.css`:
```css
--color-bg: #0d0a1a       /* тёмно-фиолетовый фон */
--color-surface: #1a1033  /* поверхности */
--color-primary: #c84bff  /* акцентный пурпур */
--color-gold: #ffd700     /* Legendary */
--color-rare: #a78bfa     /* Rare */
--color-text: #f0e6ff
```

Шрифты: **Cinzel** (заголовки, имена) + **Inter** (текст) из Google Fonts.

### Анимации: когда что использовать

| Задача | Инструмент |
|--------|-----------|
| Reveal-последовательность карточек (flip → вспышка → SVG → Lottie) | **GSAP** Timeline |
| Page transitions (`AnimatePresence` в `App.tsx`) | **Framer Motion** |
| Hover/tap эффекты (`whileHover`, `whileTap`) | **Framer Motion** |
| Stagger при монтировании RosterPage | **Framer Motion** |
| Смена outfit на CharacterPage (key prop) | **Framer Motion** |

### Проверка TypeScript

```bash
npx tsc --noEmit   # должно быть 0 ошибок
npm run build      # chunk size не должен превышать 1MB
```

### Ручное тестирование через DevTools

Тестировать механику через `Application → Local Storage → winx_game`:
- Pity: выставить `pityRare: 9` → 1 пулл → должен выпасть Rare, счётчик сбросится
- Ежедневное пополнение: выставить `lastRefillDate: '2020-01-01'` → refresh → `pullsAvailable += 10`
- Дубликат: выставить `unlockedCharacterIds: ['bloom']` → выбить Bloom повторно → должен выдать `star_power`

## Реализация: порядок фаз

Строго по `docs/IMPLEMENTATION_PLAN.md`, фазы зависят друг от друга:

1. **Фаза 1** — Scaffold, зависимости, shadcn, Tailwind v4, TS paths
2. **Фаза 2** — Типы (`src/types/`), данные (`src/data/`), SVG-заглушки
3. **Фаза 3** — Zod-схемы, gameStore, inventoryStore, dailyRefill + storage
4. **Фаза 4** — Алгоритм гачи (`src/lib/gacha.ts`)
5. **Фаза 5** — Роутинг: main.tsx, App.tsx, Layout
6. **Фаза 6** — Страницы: Home → Pull → CardReveal → Roster → Character → Collection
7. **Фаза 7** — Page transitions, Lottie-анимации, hover-эффекты
8. **Фаза 8** — Ручные проверки pity, x10 гарантии, кастомизации, TypeScript, responsive, build
