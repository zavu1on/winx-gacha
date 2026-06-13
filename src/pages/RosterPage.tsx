import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { CHARACTERS } from '@/data/characters'
import { useInventoryStore } from '@/store/inventoryStore'

export default function RosterPage() {
  const navigate = useNavigate()
  const { unlockedCharacterIds } = useInventoryStore()
  const unlockedCount = unlockedCharacterIds.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-6xl mx-auto px-4 py-10"
    >
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="font-heading text-4xl font-bold text-game-text">Ростер</h1>
        <span className="text-game-muted">
          {unlockedCount} / {CHARACTERS.length} открыто
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CHARACTERS.map((char, i) => {
          const isUnlocked = unlockedCharacterIds.includes(char.id)
          return (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={isUnlocked ? { y: -4, boxShadow: `0 8px 24px ${char.color}40` } : {}}
              onClick={() => isUnlocked && navigate(`/character/${char.id}`)}
              className={`rounded-2xl p-4 flex flex-col items-center gap-3 transition-all ${
                isUnlocked ? 'cursor-pointer' : 'cursor-default opacity-60'
              }`}
              style={{
                backgroundColor: isUnlocked ? `${char.color}18` : '#1a1033',
                border: `1px solid ${isUnlocked ? char.color + '55' : '#2a1a4a'}`,
              }}
            >
              {isUnlocked ? (
                <img src={char.svgPath} alt={char.nameRu} className="w-24 h-36 object-contain" />
              ) : (
                <div className="w-24 h-36 flex items-center justify-center">
                  <svg viewBox="0 0 200 300" className="w-24 h-36 opacity-30">
                    <rect width="200" height="300" fill="#6b7280" rx="12" />
                    <text x="100" y="160" textAnchor="middle" fill="white" fontSize="40">?</text>
                  </svg>
                </div>
              )}
              <div className="text-center">
                <p className="font-heading font-semibold text-sm" style={{ color: isUnlocked ? char.color : '#6b7280' }}>
                  {isUnlocked ? char.nameRu : '???'}
                </p>
                {isUnlocked && (
                  <p className="text-xs text-game-muted mt-0.5">{char.element}</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
