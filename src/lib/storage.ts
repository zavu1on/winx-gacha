import { GameStateSchema, InventorySchema } from './schemas'
import { useGameStore } from '@/store/gameStore'

export function initializeApp() {
  const rawGame = localStorage.getItem('winx_game')
  if (rawGame) {
    try {
      const parsed = GameStateSchema.safeParse(JSON.parse(rawGame))
      if (!parsed.success) localStorage.removeItem('winx_game')
    } catch {
      localStorage.removeItem('winx_game')
    }
  }

  const rawInv = localStorage.getItem('winx_inventory')
  if (rawInv) {
    try {
      const parsed = InventorySchema.safeParse(JSON.parse(rawInv))
      if (!parsed.success) localStorage.removeItem('winx_inventory')
    } catch {
      localStorage.removeItem('winx_inventory')
    }
  }

  useGameStore.getState().refillIfNewDay()
}
