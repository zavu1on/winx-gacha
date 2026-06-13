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
              accessoryIds: (s.equipment[characterId]?.accessoryIds ?? []).filter(
                (id) => id !== accessoryId
              ),
            },
          },
        })),

      isCharacterUnlocked: (characterId) =>
        get().unlockedCharacterIds.includes(characterId),
    }),
    { name: 'winx_inventory' }
  )
)
