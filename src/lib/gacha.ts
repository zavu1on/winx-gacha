import type { GameItem, Character, PullResult, Rarity } from '@/types'
import { CHARACTERS } from '@/data/characters'
import { ALL_RARE_ITEMS, COMMONS, STAR_POWER_ITEM } from '@/data/items'
import { useInventoryStore } from '@/store/inventoryStore'

function computeLegendaryRate(pityLegendary: number): number {
  if (pityLegendary < 90) return 0.006
  return Math.min(0.006 + 0.066 * (pityLegendary - 89), 1.0)
}

function computeRareRate(pityRare: number): number {
  if (pityRare < 7) return 0.051
  return Math.min(0.051 + 0.2 * (pityRare - 6), 1.0)
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickItem(rarity: Rarity): GameItem {
  if (rarity === 'legendary') {
    const char = pickRandom(CHARACTERS) as Character
    const isDuplicate = useInventoryStore.getState().isCharacterUnlocked(char.id)
    if (isDuplicate) return STAR_POWER_ITEM
    return char
  }
  if (rarity === 'rare') return pickRandom(ALL_RARE_ITEMS)
  return pickRandom(COMMONS)
}

interface SinglePullResult {
  rarity: Rarity
  newPityRare: number
  newPityLegendary: number
}

export function singlePull(pityRare: number, pityLegendary: number): SinglePullResult {
  const newPityRare = pityRare + 1
  const newPityLegendary = pityLegendary + 1

  if (newPityLegendary >= 120) {
    return { rarity: 'legendary', newPityRare: 0, newPityLegendary: 0 }
  }
  if (newPityRare >= 10) {
    return { rarity: 'rare', newPityRare: 0, newPityLegendary }
  }

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

export function executePulls(
  count: number,
  initialPityRare: number,
  initialPityLegendary: number
): PullResult[] {
  const results: PullResult[] = []
  let pityRare = initialPityRare
  let pityLegendary = initialPityLegendary
  let hasRareOrBetter = false

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1
    let pull = singlePull(pityRare, pityLegendary)

    if (count >= 10 && isLast && !hasRareOrBetter && pull.rarity === 'common') {
      pull = { rarity: 'rare', newPityRare: 0, newPityLegendary: pull.newPityLegendary }
    }

    if (pull.rarity !== 'common') hasRareOrBetter = true

    pityRare = pull.newPityRare
    pityLegendary = pull.newPityLegendary

    const item = pickItem(pull.rarity)
    const isDuplicate = item.id === STAR_POWER_ITEM.id

    results.push({ item, isDuplicate })
  }

  return results
}
