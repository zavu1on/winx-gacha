import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useInventoryStore } from '@/store/inventoryStore'
import { executePulls } from '@/lib/gacha'
import { playClick, playSpinStart } from '@/lib/sound'
import { CHARACTERS } from '@/data/characters'
import { ALL_ITEMS, STAR_POWER_ITEM } from '@/data/items'

function getTimeUntilMidnight(): string {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setDate(midnight.getDate() + 1)
  midnight.setHours(0, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return `${h}ч ${m}м`
}

const FAIRY_MESSAGES = [
  'Мы умчались в волшебный лес за новыми свитками!',
  'Феечки отправились к Фонтейне за магическими кристаллами!',
  'Блум и Стелла улетели к звёздам за новыми крутками!',
]

function NoPullsBanner() {
  const [msg] = useState(() => FAIRY_MESSAGES[Math.floor(Math.random() * FAIRY_MESSAGES.length)])
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight())

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      className="w-full rounded-2xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, rgba(195,98,255,0.12) 0%, rgba(244,114,182,0.12) 100%)',
        border: '1.5px solid rgba(195,98,255,0.35)',
      }}
    >
      {/* Sparkle corners */}
      <div className="absolute top-3 left-4 text-xl opacity-60">✨</div>
      <div className="absolute top-3 right-4 text-xl opacity-60">✨</div>
      <div className="absolute bottom-3 left-6 text-lg opacity-40">🌸</div>
      <div className="absolute bottom-3 right-6 text-lg opacity-40">🌸</div>

      <div className="flex flex-col items-center gap-3 px-8 py-7 text-center">
        {/* Floating fairy emoji row */}
        <div className="flex gap-3 text-3xl">
          <span className="float-anim" style={{ animationDelay: '0s' }}>🧚</span>
          <span className="float-anim" style={{ animationDelay: '0.5s' }}>🦋</span>
          <span className="float-anim" style={{ animationDelay: '1s' }}>🧚</span>
        </div>

        <p className="font-heading text-lg text-game-primary font-semibold">
          Ой! Прокруток нет...
        </p>
        <p className="text-game-text text-sm max-w-xs leading-relaxed">
          {msg}
        </p>

        <div
          className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: 'rgba(33,19,64,0.8)',
            border: '1px solid rgba(195,98,255,0.3)',
          }}
        >
          <span className="text-game-muted">Вернутся через </span>
          <span className="text-game-primary font-bold">{timeLeft}</span>
          <span className="text-game-muted"> — в полночь ✦</span>
        </div>
      </div>
    </motion.div>
  )
}

function PityBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-game-muted">{label}</span>
        <span className="font-semibold" style={{ color }}>{value}/{max}</span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          className="h-2 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}88` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { pullsAvailable, pityRare, pityLegendary, consumePulls, updatePity } = useGameStore()
  const { unlockCharacter, addItem, addRecentDrop } = useInventoryStore()
  const { recentDropIds, unlockedCharacterIds } = useInventoryStore()

  const handlePull = (count: number) => {
    if (pullsAvailable < count) return
    playClick()
    playSpinStart()
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

  const recentItems = recentDropIds.slice(0, 8).map((id) => {
    return (
      CHARACTERS.find((c) => c.id === id) ||
      ALL_ITEMS.find((i) => i.id === id) ||
      (id === 'star_power' ? STAR_POWER_ITEM : null)
    )
  }).filter(Boolean) as typeof CHARACTERS

  const unlockedCount = unlockedCharacterIds.length
  const totalChars = CHARACTERS.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto px-4 py-10 flex flex-col items-center gap-8"
    >
      {/* Hero section */}
      <div className="w-full relative overflow-hidden">
        {/* Decorative fairy silhouettes — only on sm+ to avoid mobile overflow */}
        <div className="hidden sm:block absolute -left-6 top-0 bottom-0 w-28 pointer-events-none">
          <img
            src="/assets/characters/bloom.png"
            alt=""
            aria-hidden
            className="absolute -bottom-2 -left-4 w-28 object-contain float-anim-slow opacity-20 select-none"
            style={{ animationDelay: '0s', filter: 'blur(1px) saturate(0.3)' }}
          />
        </div>
        <div className="hidden sm:block absolute -right-6 top-0 bottom-0 w-28 pointer-events-none">
          <img
            src="/assets/characters/stella.png"
            alt=""
            aria-hidden
            className="absolute -bottom-2 -right-4 w-28 object-contain float-anim-slow opacity-20 select-none"
            style={{ animationDelay: '1.8s', filter: 'blur(1px) saturate(0.3)', transform: 'scaleX(-1)' }}
          />
        </div>

        <div className="text-center relative z-10 py-2">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-1 tracking-wide">
            Winx Gacha
          </h1>
          <p className="text-game-muted text-sm sm:text-base mt-1">Открой своих любимых персонажей ✦</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="w-full rounded-2xl px-4 py-4 glass-card grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold gradient-text font-heading">{unlockedCount}</div>
          <div className="text-[11px] sm:text-xs text-game-muted mt-0.5">Открыто</div>
        </div>
        <div className="text-center border-x border-game-border">
          <div className="text-xl sm:text-2xl font-bold text-game-gold font-heading shimmer-gold">{totalChars}</div>
          <div className="text-[11px] sm:text-xs text-game-muted mt-0.5">Фей всего</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-game-primary font-heading">{pullsAvailable}</div>
          <div className="text-[11px] sm:text-xs text-game-muted mt-0.5">Прокруток</div>
        </div>
      </div>

      {/* Pulls progress */}
      <div className="w-full glass-card rounded-2xl px-5 py-4 flex flex-col gap-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-game-text font-medium">Прокрутки сегодня</span>
            <span className="text-game-primary font-bold">{pullsAvailable} / 40</span>
          </div>
          <div className="w-full h-3 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
            <motion.div
              className="h-3 rounded-full pulse-glow-anim"
              style={{
                background: 'linear-gradient(90deg, #c362ff, #f472b6)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(pullsAvailable / 40) * 100}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Pity counters */}
        <div className="flex gap-4 pt-1">
          <PityBar label="Гарантия Rare" value={pityRare} max={10} color="#c4aaff" />
          <PityBar label="Гарантия Legendary" value={pityLegendary} max={120} color="#f5d060" />
        </div>
      </div>

      {/* Pull buttons or NoPulls banner */}
      <AnimatePresence mode="wait">
        {pullsAvailable === 0 ? (
          <NoPullsBanner key="no-pulls" />
        ) : (
          <motion.div
            key="pull-buttons"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handlePull(1)}
                disabled={pullsAvailable < 1}
                className="w-full sm:w-auto px-8 py-4 sm:py-3.5 font-semibold rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-base"
                style={{
                  background: 'linear-gradient(135deg, #c362ff, #a040dd)',
                  boxShadow: '0 0 20px rgba(195,98,255,0.4)',
                }}
              >
                Открыть ×1
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handlePull(10)}
                disabled={pullsAvailable < 10}
                className="w-full sm:w-auto px-8 py-4 sm:py-3.5 font-semibold rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-base"
                style={{
                  background: 'linear-gradient(135deg, #f472b6, #c362ff)',
                  boxShadow: '0 0 20px rgba(244,114,182,0.4)',
                }}
              >
                Открыть ×10
              </motion.button>
            </div>
            {pullsAvailable >= 10 && (
              <p className="text-xs text-game-muted text-center">✦ x10 гарантирует минимум 1 Rare</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent drops */}
      {recentItems.length > 0 && (
        <div className="w-full">
          <h2 className="text-game-muted text-sm font-medium mb-3 flex items-center gap-2">
            <span>Последние выпадения</span>
            <span className="text-xs opacity-50">({recentItems.length})</span>
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recentItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center cursor-default relative group"
                style={{
                  backgroundColor: `${item.color}18`,
                  border: `1px solid ${item.color}44`,
                }}
              >
                <img src={item.svgPath} alt={item.nameRu} className="w-10 h-10 object-contain" />
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs text-game-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
                  style={{ backgroundColor: 'rgba(33,19,64,0.95)', border: '1px solid rgba(195,98,255,0.3)' }}
                >
                  {item.nameRu}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Decorative fairy row when collection is empty */}
      {recentItems.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-6 opacity-60">
          <div className="flex gap-2 text-4xl">
            <span className="float-anim" style={{ animationDelay: '0s' }}>🧚</span>
            <span className="float-anim" style={{ animationDelay: '0.7s' }}>✨</span>
            <span className="float-anim" style={{ animationDelay: '1.4s' }}>🧚</span>
          </div>
          <p className="text-game-muted text-sm">Открывай крутки и собирай фей!</p>
        </div>
      )}
    </motion.div>
  )
}
