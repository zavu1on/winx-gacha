import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useInventoryStore } from '@/store/inventoryStore'
import { executePulls } from '@/lib/gacha'
import { CHARACTERS } from '@/data/characters'
import { ALL_ITEMS, STAR_POWER_ITEM } from '@/data/items'

export default function HomePage() {
  const navigate = useNavigate()
  const { pullsAvailable, pityRare, pityLegendary, consumePulls, updatePity } = useGameStore()
  const { unlockCharacter, addItem, addRecentDrop } = useInventoryStore()
  const { recentDropIds } = useInventoryStore()

  const handlePull = (count: number) => {
    if (pullsAvailable < count) return
    const results = executePulls(count, pityRare, pityLegendary)

    results.forEach((r) => {
      if (r.item.type === 'character' && !r.isDuplicate) {
        unlockCharacter(r.item.id)
      } else {
        addItem(r.item.id)
      }
      addRecentDrop(r.item.id)
      updatePity(r.item.rarity)
    })

    consumePulls(count)
    navigate('/pull', { state: { results } })
  }

  const recentItems = recentDropIds.slice(0, 5).map((id) => {
    return (
      CHARACTERS.find((c) => c.id === id) ||
      ALL_ITEMS.find((i) => i.id === id) ||
      (id === 'star_power' ? STAR_POWER_ITEM : null)
    )
  }).filter(Boolean) as typeof CHARACTERS

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center gap-8"
    >
      <div className="text-center">
        <h1 className="font-heading text-5xl font-bold text-game-primary mb-2">Winx Gacha</h1>
        <p className="text-game-muted text-lg">Открой своих любимых персонажей</p>
      </div>

      <div className="w-full">
        <div className="flex justify-between text-sm text-game-muted mb-1">
          <span>Прокрутки</span>
          <span>{pullsAvailable} / 40</span>
        </div>
        <div className="w-full bg-game-surface rounded-full h-2">
          <div
            className="bg-game-primary h-2 rounded-full transition-all"
            style={{ width: `${(pullsAvailable / 40) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePull(1)}
          disabled={pullsAvailable < 1}
          className="px-8 py-3 bg-game-primary text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Открыть ×1
        </motion.button>
      </div>

      {recentItems.length > 0 && (
        <div className="w-full">
          <h2 className="text-game-muted text-sm font-medium mb-3">Последние выпадения</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentItems.map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${item.color}22`, border: `1px solid ${item.color}55` }}
              >
                <img src={item.svgPath} alt={item.nameRu} className="w-10 h-10 object-contain" />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
