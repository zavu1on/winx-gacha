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
      <div className="flex items-baseline justify-between mb-6 sm:mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold gradient-text">Ростер</h1>
        <span className="text-game-muted text-sm">
          {unlockedCount} / {CHARACTERS.length} открыто
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {CHARACTERS.map((char, i) => {
          const isUnlocked = unlockedCharacterIds.includes(char.id)
          return (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={isUnlocked ? { y: -4, boxShadow: `0 8px 24px ${char.color}40` } : {}}
              whileTap={isUnlocked ? { scale: 0.97 } : {}}
              onClick={() => isUnlocked && navigate(`/character/${char.id}`)}
              className={`rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 transition-all ${
                isUnlocked ? 'cursor-pointer' : 'cursor-default opacity-50'
              }`}
              style={{
                backgroundColor: isUnlocked ? `${char.color}18` : 'rgba(33,19,64,0.5)',
                border: `1px solid ${isUnlocked ? char.color + '55' : 'rgba(195,98,255,0.12)'}`,
              }}
            >
              {isUnlocked ? (
                <img src={char.svgPath} alt={char.nameRu} className="w-20 h-28 sm:w-24 sm:h-36 object-contain" />
              ) : (
                <div className="w-20 h-28 sm:w-24 sm:h-36 flex items-center justify-center">
                  <svg viewBox="0 0 200 300" className="w-20 h-28 sm:w-24 sm:h-36 opacity-25">
                    <rect width="200" height="300" fill="#6b7280" rx="12" />
                    <text x="100" y="160" textAnchor="middle" fill="white" fontSize="40">?</text>
                  </svg>
                </div>
              )}
              <div className="text-center">
                <p className="font-heading font-semibold text-xs sm:text-sm" style={{ color: isUnlocked ? char.color : '#6b7280' }}>
                  {isUnlocked ? char.nameRu : '???'}
                </p>
                {isUnlocked && (
                  <p className="text-[10px] sm:text-xs text-game-muted mt-0.5 line-clamp-1">{char.element}</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
