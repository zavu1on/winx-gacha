import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getDailyRefill } from '@/lib/dailyRefill'
import type { Rarity } from '@/types'

interface GameStore {
  pullsAvailable: number
  lastRefillDate: string
  pityRare: number
  pityLegendary: number

  consumePull: () => void
  consumePulls: (n: number) => void
  updatePity: (rarity: Rarity) => void
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
        const refill = getDailyRefill(state.pullsAvailable, state.lastRefillDate, 10, 40)
        if (refill) set(refill)
      },
    }),
    { name: 'winx_game' }
  )
)
