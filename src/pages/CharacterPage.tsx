import { useParams, useNavigate } from 'react-router'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CHARACTERS } from '@/data/characters'
import { OUTFITS, ACCESSORIES } from '@/data/items'
import { useInventoryStore } from '@/store/inventoryStore'

export default function CharacterPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { unlockedCharacterIds, ownedItemIds, equipment, equipOutfit, addAccessory, removeAccessory } =
    useInventoryStore()

  const character = CHARACTERS.find((c) => c.id === id)
  const isUnlocked = id ? unlockedCharacterIds.includes(id) : false

  useEffect(() => {
    if (!character || !isUnlocked) navigate('/roster', { replace: true })
  }, [character, isUnlocked, navigate])

  if (!character || !isUnlocked) return null

  const charEquip = equipment[character.id] ?? { outfitId: null, accessoryIds: [] }
  const myOutfits = OUTFITS.filter((o) => o.characterId === character.id && ownedItemIds.includes(o.id))
  const myAccessories = ACCESSORIES.filter((a) => a.characterId === character.id && ownedItemIds.includes(a.id))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto px-4 py-10"
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={charEquip.outfitId ?? 'base'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <img src={character.svgPath} alt={character.nameRu} className="w-48 h-72 object-contain" />
            </motion.div>
          </AnimatePresence>
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold" style={{ color: character.color }}>
              {character.nameRu}
            </h1>
            <p className="text-game-muted text-sm">{character.element} · {character.planet}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h2 className="text-game-muted text-xs font-semibold uppercase tracking-wider mb-3">Наряды</h2>
            {myOutfits.length === 0 ? (
              <p className="text-game-muted text-sm">Нет нарядов</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {myOutfits.map((outfit) => (
                  <button
                    key={outfit.id}
                    onClick={() =>
                      equipOutfit(character.id, charEquip.outfitId === outfit.id ? null : outfit.id)
                    }
                    className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                    style={{
                      border: `2px solid ${charEquip.outfitId === outfit.id ? '#ffd700' : outfit.color + '44'}`,
                      backgroundColor: `${outfit.color}15`,
                    }}
                  >
                    <img src={outfit.svgPath} alt={outfit.nameRu} className="w-10 h-10 object-contain" />
                    <span className="text-xs text-game-text">{outfit.nameRu.split(' ').pop()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-game-muted text-xs font-semibold uppercase tracking-wider mb-3">
              Аксессуары ({charEquip.accessoryIds.length}/3)
            </h2>
            <div className="flex gap-3 mb-3">
              {Array.from({ length: 3 }).map((_, i) => {
                const accId = charEquip.accessoryIds[i]
                const acc = accId ? myAccessories.find((a) => a.id === accId) : undefined
                return (
                  <button
                    key={i}
                    onClick={() => acc && removeAccessory(character.id, acc.id)}
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      border: `1px solid ${acc ? acc.color + '88' : '#2a1a4a'}`,
                      backgroundColor: acc ? `${acc.color}18` : '#1a1033',
                    }}
                  >
                    {acc ? (
                      <img src={acc.svgPath} alt={acc.nameRu} className="w-9 h-9 object-contain" />
                    ) : (
                      <span className="text-game-muted text-xl">+</span>
                    )}
                  </button>
                )
              })}
            </div>
            {myAccessories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {myAccessories
                  .filter((a) => !charEquip.accessoryIds.includes(a.id))
                  .map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => addAccessory(character.id, acc.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-game-text transition-all"
                      style={{ backgroundColor: `${acc.color}22`, border: `1px solid ${acc.color}44` }}
                    >
                      <img src={acc.svgPath} alt="" className="w-5 h-5 object-contain" />
                      {acc.nameRu}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
