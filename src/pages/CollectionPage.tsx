import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CHARACTERS } from '@/data/characters'
import { OUTFITS, ACCESSORIES, COMMONS, STAR_POWER_ITEM } from '@/data/items'
import { useInventoryStore } from '@/store/inventoryStore'
import type { GameItem } from '@/types'

const RARITY_COLOR: Record<string, string> = {
  legendary: '#ffd700',
  rare: '#a78bfa',
  common: '#6b7280',
}

function ItemCard({ item, count }: { item: GameItem; count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-2 p-3 rounded-xl"
      style={{
        backgroundColor: `${RARITY_COLOR[item.rarity]}15`,
        border: `1px solid ${RARITY_COLOR[item.rarity]}40`,
      }}
    >
      <img src={item.svgPath} alt={item.nameRu} className="w-10 h-10 object-contain" />
      <span className="text-xs text-center text-game-text leading-tight">{item.nameRu}</span>
      <span className="text-xs font-bold" style={{ color: RARITY_COLOR[item.rarity] }}>
        {item.rarity}{count > 1 ? ` ×${count}` : ''}
      </span>
    </motion.div>
  )
}

export default function CollectionPage() {
  const [activeTab, setActiveTab] = useState('all')
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
    all: [...characters, ...ownedItems],
    characters,
    outfits,
    accessories,
    commons,
  }

  const totalMap = {
    all: CHARACTERS.length + allItems.length,
    characters: CHARACTERS.length,
    outfits: OUTFITS.length,
    accessories: ACCESSORIES.length,
    commons: COMMONS.length + 1,
  }

  const current = tabItems[activeTab as keyof typeof tabItems]
  const total = totalMap[activeTab as keyof typeof totalMap]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-6xl mx-auto px-4 py-10"
    >
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-heading text-4xl font-bold text-game-text">Коллекция</h1>
        <span className="text-game-muted">{current.length} / {total} получено</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-game-surface">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="characters">Персонажи</TabsTrigger>
          <TabsTrigger value="outfits">Наряды</TabsTrigger>
          <TabsTrigger value="accessories">Аксессуары</TabsTrigger>
          <TabsTrigger value="commons">Обычные</TabsTrigger>
        </TabsList>

        {(['all', 'characters', 'outfits', 'accessories', 'commons'] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            {tabItems[tab].length === 0 ? (
              <p className="text-game-muted text-center py-16">Пусто — открывай кейсы!</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {tabItems[tab].map((item) => (
                  <ItemCard key={item.id} item={item} count={countMap[item.id] ?? 1} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  )
}
