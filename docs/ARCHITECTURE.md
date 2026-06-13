# Архитектура приложения — Winx Gacha

## Страницы и роуты

| Роут | Компонент | Назначение |
|------|-----------|------------|
| `/` | `HomePage` | Счётчик прокруток, кнопки x1/x10, последние выпадения |
| `/pull` | `PullPage` | Анимация выпадения (результаты передаются через router state) |
| `/roster` | `RosterPage` | Ростер всех персонажей — открытые (цветные) и закрытые (силуэты) |
| `/character/:id` | `CharacterPage` | Просмотр персонажа + экипировка нарядов и аксессуаров |
| `/collection` | `CollectionPage` | Весь инвентарь по вкладкам (все / персонажи / наряды / аксессуары / обычные) |

## Дерево компонентов

```
App
└── BrowserRouter
    └── Layout (NavBar + PullsCounter + Outlet)
        ├── HomePage
        │   ├── PullButton (×1)
        │   ├── PullButton (×10)
        │   └── RecentDrops (последние 5 предметов)
        │
        ├── PullPage
        │   ├── CardRevealSequence          ← GSAP-orchestrated
        │   │   └── CardReveal × N
        │   │       ├── CardBack            (до флипа)
        │   │       └── CardFront           (после флипа: SVG + rarity badge)
        │   ├── LegendaryReveal             (SVG персонажа + Lottie частицы)
        │   └── PullSummary                 (список результатов + кнопки навигации)
        │
        ├── RosterPage
        │   └── CharacterGrid
        │       └── CharacterCard × 14      (locked / unlocked)
        │
        ├── CharacterPage
        │   ├── CharacterViewer             (SVG + текущий outfit)
        │   ├── OutfitPicker               (горизонтальная карусель нарядов)
        │   └── AccessoryPicker            (слоты аксессуаров, до 3)
        │
        └── CollectionPage
            ├── TabBar                      (фильтры по типу)
            └── ItemGrid
                └── ItemCard × N
```

## Zustand Stores

### gameStore (`src/store/gameStore.ts`)

```typescript
interface GameState {
  pullsAvailable: number       // 0–40
  maxDailyPulls: number        // 10 (константа)
  maxAccumulated: number       // 40 (константа)
  lastRefillDate: string       // 'YYYY-MM-DD'
  pityRare: number             // 0–9 (сбрасывается при Rare/Legendary)
  pityLegendary: number        // 0–119 (сбрасывается при Legendary)
}

interface GameActions {
  consumePull(): void          // -1 к pullsAvailable, бросает если 0
  consumePulls(n: number): void
  updatePity(rarity: Rarity): void  // обновляет и сбрасывает счётчики
  refillIfNewDay(): void       // вызывается при монтировании App
}
```

localStorage ключ: `winx_game`

### inventoryStore (`src/store/inventoryStore.ts`)

```typescript
interface InventoryState {
  unlockedCharacterIds: string[]
  ownedItemIds: string[]          // с повторами (для дубликатов)
  equipment: Record<string, {     // characterId → экипировка
    outfitId: string | null
    accessoryIds: string[]        // до 3 слотов
  }>
  recentDropIds: string[]         // последние 10 (для RecentDrops)
}

interface InventoryActions {
  unlockCharacter(characterId: string): void
  addItem(itemId: string): void
  addRecentDrop(itemId: string): void
  equipOutfit(characterId: string, outfitId: string | null): void
  addAccessory(characterId: string, accessoryId: string): void
  removeAccessory(characterId: string, accessoryId: string): void
  isCharacterUnlocked(characterId: string): boolean
}
```

localStorage ключ: `winx_inventory`

## Типы данных (`src/types/index.ts`)

```typescript
export type Rarity = 'common' | 'rare' | 'legendary'
export type ItemType = 'character' | 'outfit' | 'accessory' | 'common'

export interface GameItem {
  id: string
  name: string           // EN
  nameRu: string         // RU
  rarity: Rarity
  type: ItemType
  characterId?: string   // для outfit/accessory — к кому привязан
  svgPath: string        // путь к SVG: '/assets/characters/bloom.svg'
  lottiePath?: string    // путь к Lottie JSON (опционально)
  description: string
  color: string          // primary hex, используется для UI-акцентов
}

export interface Character extends GameItem {
  type: 'character'
  element: string
  planet: string
}

export interface PullResult {
  item: GameItem
  isDuplicate: boolean   // true если персонаж уже был открыт
}
```

## localStorage: схема и инициализация

### Схема данных (Zod, `src/lib/schemas.ts`)

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
```

### Инициализация (`src/lib/storage.ts`)

```typescript
export function initializeApp() {
  // 1. Валидируем gameStore из localStorage
  const raw = localStorage.getItem('winx_game')
  if (raw) {
    const parsed = GameStateSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      localStorage.removeItem('winx_game') // сброс к дефолту
    }
  }

  // 2. Валидируем inventoryStore
  const rawInv = localStorage.getItem('winx_inventory')
  if (rawInv) {
    const parsed = InventorySchema.safeParse(JSON.parse(rawInv))
    if (!parsed.success) {
      localStorage.removeItem('winx_inventory')
    }
  }

  // 3. Пополнение прокруток (если новый день)
  useGameStore.getState().refillIfNewDay()
}
```

Вызывается в `main.tsx` до `ReactDOM.createRoot(...).render(...)`.

## Алгоритм гачи (`src/lib/gacha.ts`)

```typescript
// Вычисление вероятностей с учётом soft pity
function computeLegendaryRate(pityLegendary: number): number {
  if (pityLegendary < 90) return 0.006
  return Math.min(0.006 + 0.066 * (pityLegendary - 89), 1.0)
}

function computeRareRate(pityRare: number): number {
  if (pityRare < 7) return 0.051
  return Math.min(0.051 + 0.20 * (pityRare - 6), 1.0)
}

// Основная функция пулла
export function singlePull(
  pityRare: number,
  pityLegendary: number
): { rarity: Rarity; newPityRare: number; newPityLegendary: number } {
  const newPityRare = pityRare + 1
  const newPityLegendary = pityLegendary + 1

  // Hard pity
  if (newPityLegendary >= 120) {
    return { rarity: 'legendary', newPityRare: 0, newPityLegendary: 0 }
  }
  if (newPityRare >= 10) {
    return { rarity: 'rare', newPityRare: 0, newPityLegendary }
  }

  // Soft pity + random
  const legRate = computeLegendaryRate(newPityLegendary)
  const rareRate = computeRareRate(newPityRare)
  const roll = Math.random()

  if (roll < legRate) {
    return { rarity: 'legendary', newPityRare: 0, newPityLegendary: 0 }
  }
  if (roll < legRate + rareRate) {
    return { rarity: 'rare', newPityRare: 0, newPityLegendary }
  }
  return { rarity: 'common', newPityRare, newPityLegendary }
}

// x10 пулл с гарантией хотя бы одного Rare
export function multiPull(
  count: number,
  initialPityRare: number,
  initialPityLegendary: number,
  items: { characters: Character[], outfits: GameItem[], accessories: GameItem[], commons: GameItem[] }
): PullResult[] {
  const results: PullResult[] = []
  let pityRare = initialPityRare
  let pityLegendary = initialPityLegendary
  let hasRareOrBetter = false

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1
    let pull = singlePull(pityRare, pityLegendary)

    // Форсируем Rare на последнем пулле если ещё не было
    if (isLast && !hasRareOrBetter && pull.rarity === 'common') {
      pull = { rarity: 'rare', newPityRare: 0, newPityLegendary: pull.newPityLegendary }
    }

    if (pull.rarity !== 'common') hasRareOrBetter = true
    pityRare = pull.newPityRare
    pityLegendary = pull.newPityLegendary

    const item = pickItem(pull.rarity, items)
    const isDuplicate = pull.rarity === 'legendary'
      && useInventoryStore.getState().isCharacterUnlocked(item.id)

    results.push({ item: isDuplicate ? STAR_POWER_ITEM : item, isDuplicate })
  }

  return results
}
```

## Анимация выпадения — GSAP Timeline

```typescript
// CardRevealSequence.tsx — последовательность для N карточек
function playRevealSequence(cards: HTMLElement[], results: PullResult[]) {
  const tl = gsap.timeline()

  // 1. Оверлей появляется
  tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 })

  // 2. Карточки появляются стопкой
  tl.fromTo(cards,
    { scale: 0.8, opacity: 0, y: 20 },
    { scale: 1, opacity: 1, y: 0, stagger: 0.1, duration: 0.4 }
  )

  // Клик на карточку → flip (управляется через ref и обработчик событий)
}

// Флип отдельной карточки
function flipCard(card: HTMLElement, result: PullResult) {
  const tl = gsap.timeline()

  tl.to(card, { rotateY: 90, duration: 0.3 })
  tl.call(() => showFront(card, result))
  tl.to(card, { rotateY: 0, duration: 0.3 })

  if (result.item.rarity === 'legendary') {
    tl.call(() => playLegendaryEffect(result.item))
  } else if (result.item.rarity === 'rare') {
    tl.call(() => playRareEffect())
  }
}

// Спецэффект при Legendary
function playLegendaryEffect(character: GameItem) {
  const tl = gsap.timeline()

  // Золотая вспышка
  tl.to(flashOverlay, { backgroundColor: '#ffd700', opacity: 0.8, duration: 0.15 })
  tl.to(flashOverlay, { opacity: 0, duration: 0.3 })

  // SVG персонажа влетает снизу
  tl.fromTo(characterSvg,
    { y: 100, scale: 0.8, opacity: 0 },
    { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.2)' }
  )

  // Запускаем Lottie-частицы (через ref.current.play())
  tl.call(() => lottieRef.current?.play(), [], '-=0.4')

  // Typewriter для имени
  tl.call(() => startTypewriter(character.nameRu), [], '-=0.3')
}
```

## Ежедневное пополнение (`src/lib/dailyRefill.ts`)

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

## Верификация (тест-план)

### 1. Механика pity

```
DevTools → Application → localStorage → winx_game
Установить: { "pityRare": 9, ... }
Действие: выполнить 1 пулл
Ожидание: выпадает Rare, pityRare сбрасывается в 0

Установить: { "pityLegendary": 119, ... }
Действие: выполнить 1 пулл
Ожидание: выпадает Legendary, оба pity сбрасываются в 0
```

### 2. Ежедневный лимит

```
Установить: lastRefillDate на вчерашнюю дату (YYYY-MM-DD)
Действие: обновить страницу
Ожидание: pullsAvailable увеличился на 10 (не превышая 40)
```

### 3. Анимация

```
Действие: нажать «Открыть ×10»
Ожидание: 10 карточек появляются стопкой → при клике каждая переворачивается →
          при Legendary выполняется золотая вспышка + SVG влетает + Lottie играет
```

### 4. Кастомизация

```
Условие: персонаж Блум разблокирован, есть наряд outfit_bloom_enchantix
Действие: перейти на /character/bloom → выбрать Enchantix в OutfitPicker
Ожидание: SVG обновляется → в localStorage equipment['bloom'].outfitId = 'outfit_bloom_enchantix'
```

### 5. Дубликат

```
Условие: персонаж Блум уже разблокирован
Действие: выбить Блум повторно
Ожидание: в инвентаре появляется 'star_power', а не второй персонаж
```

### 6. TypeScript и сборка

```bash
npm run tsc --noEmit  # 0 ошибок
npm run build         # успешная сборка
```
