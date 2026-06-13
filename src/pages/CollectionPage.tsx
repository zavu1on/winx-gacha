import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ItemDetailModal } from '@/components/ItemDetailModal'
import { CHARACTERS } from '@/data/characters'
import { OUTFITS, ACCESSORIES, COMMONS, STAR_POWER_ITEM } from '@/data/items'
import { useInventoryStore } from '@/store/inventoryStore'
import { playTabSwitch, playItemHover } from '@/lib/sound'
import type { GameItem } from '@/types'

const RARITY_COLOR: Record<string, string> = {
  legendary: '#f5d060',
  rare: '#c4aaff',
  common: '#8b87a8',
}

function ItemCard({
  item,
  count,
  onClick,
}: {
  item: GameItem
  count: number
  onClick: () => void
}) {
  const color = RARITY_COLOR[item.rarity]
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onClick={onClick}
      onMouseEnter={playItemHover}
      className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer text-left transition-shadow"
      style={{
        backgroundColor: `${color}12`,
        border: `1px solid ${color}35`,
        boxShadow: `0 2px 12px ${color}0d`,
      }}
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}18` }}
      >
        <img src={item.svgPath} alt={item.nameRu} className="w-10 h-10 object-contain" />
      </div>
      <span className="text-xs text-center text-game-text leading-tight line-clamp-2 w-full">
        {item.nameRu}
      </span>
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-bold" style={{ color }}>
          {item.rarity === 'legendary' ? '★★★' : item.rarity === 'rare' ? '★★' : '★'}
        </span>
        {count > 1 && (
          <span className="text-[10px] text-game-muted">×{count}</span>
        )}
      </div>
    </motion.button>
  )
}

export default function CollectionPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null)
  const { unlockedCharacterIds, ownedItemIds } = useInventoryStore()

  const allItems = [...OUTFITS, ...ACCESSORIES, ...COMMONS, STAR_POWER_ITEM]

  const countMap: Record<string, number> = {}
  ownedItemIds.forEach((id) => { countMap[id] = (countMap[id] ?? 0) + 1 })

  const characters = CHARACTERS.filter((c) => unlockedCharacterIds.includes(c.id))
  const ownedItems = allItems.filter((i) => countMap[i.id])
  const outfits = ownedItems.filter((i) => i.type === 'outfit')
  const accessories = ownedItems.filter((i) => i.type === 'accessory')
  const commons = ownedItems.filter((i) => i.type === 'common')

  const tabItems = {
    all: [...characters, ...ownedItems] as GameItem[],
    characters: characters as GameItem[],
    outfits: outfits as GameItem[],
    accessories: accessories as GameItem[],
    commons: commons as GameItem[],
  }

  const totalMap = {
    all: CHARACTERS.length + allItems.length,
    characters: CHARACTERS.length,
    outfits: OUTFITS.length,
    accessories: ACCESSORIES.length,
    commons: COMMONS.length + 1,
  }

  const handleTabChange = (v: string) => {
    setActiveTab(v)
    playTabSwitch()
  }

  const current = tabItems[activeTab as keyof typeof tabItems]
  const total = totalMap[activeTab as keyof typeof totalMap]
  const pct = Math.round((current.length / total) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-6xl mx-auto px-4 py-10"
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold gradient-text">Коллекция</h1>
          <p className="text-game-muted text-sm mt-1">
            Нажми на предмет для подробностей
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-game-primary font-bold text-xl font-heading">
            {current.length}<span className="text-game-muted font-normal text-base"> / {total}</span>
          </div>
          <div className="text-game-muted text-xs">{pct}% получено</div>
          {/* Mini progress bar */}
          <div className="w-24 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c362ff, #f472b6)' }}
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList
          className="mb-6 w-full sm:w-auto"
          style={{ backgroundColor: 'rgba(33,19,64,0.8)', border: '1px solid rgba(195,98,255,0.2)' }}
        >
          {(['all', 'characters', 'outfits', 'accessories', 'commons'] as const).map((tab) => {
            const labels: Record<string, string> = {
              all: 'Все',
              characters: 'Персонажи',
              outfits: 'Наряды',
              accessories: 'Аксессуары',
              commons: 'Обычные',
            }
            return (
              <TabsTrigger key={tab} value={tab}>
                {labels[tab]}
                <span className="ml-1.5 text-[10px] opacity-60">
                  {tabItems[tab].length}
                </span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {(['all', 'characters', 'outfits', 'accessories', 'commons'] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            {tabItems[tab].length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <div className="flex gap-2 text-4xl">
                  <span className="float-anim" style={{ animationDelay: '0s' }}>🧚</span>
                  <span className="float-anim" style={{ animationDelay: '0.6s' }}>✨</span>
                  <span className="float-anim" style={{ animationDelay: '1.2s' }}>🧚</span>
                </div>
                <p className="text-game-muted">Пусто — открывай прокрутки на главной!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {tabItems[tab].map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    count={countMap[item.id] ?? 1}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <ItemDetailModal
        item={selectedItem}
        count={selectedItem ? (countMap[selectedItem.id] ?? 1) : 1}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </motion.div>
  )
}
