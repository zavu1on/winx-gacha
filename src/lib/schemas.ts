import { z } from 'zod'

export const GameStateSchema = z.object({
  pullsAvailable: z.number().min(0).max(40),
  lastRefillDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  pityRare: z.number().min(0).max(9),
  pityLegendary: z.number().min(0).max(119),
})

export const InventorySchema = z.object({
  unlockedCharacterIds: z.array(z.string()),
  ownedItemIds: z.array(z.string()),
  equipment: z.record(
    z.string(),
    z.object({
      outfitId: z.string().nullable(),
      accessoryIds: z.array(z.string()),
    })
  ),
  recentDropIds: z.array(z.string()),
})

export type GameStateData = z.infer<typeof GameStateSchema>
export type InventoryData = z.infer<typeof InventorySchema>
