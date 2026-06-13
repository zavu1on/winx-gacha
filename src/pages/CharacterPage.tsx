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
      className="max-w-4xl mx-auto px-4 py-6 sm:py-10"
    >
      <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
        {/* Character portrait */}
        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-4 shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={charEquip.outfitId ?? 'base'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl overflow-hidden p-2"
              style={{ backgroundColor: `${character.color}12`, border: `1px solid ${character.color}44` }}
            >
              <img
                src={character.svgPath}
                alt={character.nameRu}
                className="w-32 h-48 sm:w-48 sm:h-72 object-contain"
              />
            </motion.div>
          </AnimatePresence>
          <div className="text-center md:text-center flex-1 md:flex-none">
            <h1 className="font-heading text-xl sm:text-2xl font-bold" style={{ color: character.color }}>
              {character.nameRu}
            </h1>
            <p className="text-game-muted text-xs sm:text-sm mt-0.5">{character.element}</p>
            <p className="text-game-muted text-xs mt-0.5 opacity-70">{character.planet}</p>
          </div>
        </div>

        {/* Equipment panel */}
        <div className="flex-1 flex flex-col gap-5 sm:gap-6">
          {/* Outfits */}
          <div>
            <h2 className="text-game-muted text-xs font-semibold uppercase tracking-wider mb-3">Наряды</h2>
            {myOutfits.length === 0 ? (
              <p className="text-game-muted text-sm">Нет нарядов — выбивай из прокруток!</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {myOutfits.map((outfit) => (
                  <button
                    key={outfit.id}
                    onClick={() =>
                      equipOutfit(character.id, charEquip.outfitId === outfit.id ? null : outfit.id)
                    }
                    className="shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95"
                    style={{
                      border: `2px solid ${charEquip.outfitId === outfit.id ? '#f5d060' : outfit.color + '44'}`,
                      backgroundColor: `${outfit.color}15`,
                      minWidth: 64,
                    }}
                  >
                    <img src={outfit.svgPath} alt={outfit.nameRu} className="w-10 h-10 object-contain" />
                    <span className="text-[10px] text-game-text">{outfit.nameRu.split(' ').pop()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Accessories */}
          <div>
            <h2 className="text-game-muted text-xs font-semibold uppercase tracking-wider mb-3">
              Аксессуары ({charEquip.accessoryIds.length}/3)
            </h2>
            {/* Equipped slots */}
            <div className="flex gap-3 mb-3">
              {Array.from({ length: 3 }).map((_, i) => {
                const accId = charEquip.accessoryIds[i]
                const acc = accId ? myAccessories.find((a) => a.id === accId) : undefined
                return (
                  <button
                    key={i}
                    onClick={() => acc && removeAccessory(character.id, acc.id)}
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{
                      border: `1px solid ${acc ? acc.color + '88' : 'rgba(195,98,255,0.2)'}`,
                      backgroundColor: acc ? `${acc.color}18` : 'rgba(33,19,64,0.6)',
                    }}
                    title={acc ? `Снять ${acc.nameRu}` : 'Слот пуст'}
                  >
                    {acc ? (
                      <img src={acc.svgPath} alt={acc.nameRu} className="w-9 h-9 object-contain" />
                    ) : (
                      <span className="text-game-muted text-2xl leading-none">+</span>
                    )}
                  </button>
                )
              })}
            </div>
            {/* Available accessories */}
            {myAccessories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {myAccessories
                  .filter((a) => !charEquip.accessoryIds.includes(a.id))
                  .map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => addAccessory(character.id, acc.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-game-text transition-all active:scale-95"
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
