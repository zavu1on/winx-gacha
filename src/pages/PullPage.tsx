import { useLocation, useNavigate } from 'react-router'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaseSpinner } from '@/components/CaseSpinner'
import { ALL_ITEMS, COMMONS } from '@/data/items'
import { CHARACTERS } from '@/data/characters'
import { playClick, playSpinStop } from '@/lib/sound'
import type { PullResult } from '@/types'

type Phase = 'spinning' | 'reveal'

const RARITY_COLOR: Record<string, string> = {
  legendary: '#ffd700',
  rare: '#a78bfa',
  common: '#6b7280',
}

// Pool of items shown in the spinner strip (weighted toward common)
const SPINNER_POOL = [
  ...COMMONS,
  ...COMMONS,
  ...COMMONS,
  ...ALL_ITEMS,
  ...CHARACTERS,
]

export default function PullPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const results: PullResult[] | undefined = location.state?.results

  const [phase, setPhase] = useState<Phase>('spinning')
  const isX10 = (results?.length ?? 0) >= 10

  // For x10: find best result for the spinner reveal (highest rarity)
  const spinnerResult = useMemo(() => {
    if (!results) return null
    if (isX10) {
      return (
        results.find((r) => r.item.rarity === 'legendary') ??
        results.find((r) => r.item.rarity === 'rare') ??
        results[0]
      )
    }
    return results[0]
  }, [results, isX10])

  useEffect(() => {
    if (!results) navigate('/', { replace: true })
  }, [results, navigate])

  const handleSpinComplete = useCallback(() => {
    if (spinnerResult) {
      playSpinStop(spinnerResult.item.rarity)
    }
    setPhase('reveal')
  }, [spinnerResult])

  if (!results || !spinnerResult) return null

  const spinDuration = isX10 ? 2.8 : 4.5

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start px-3 sm:px-4 py-6 sm:py-10 max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {phase === 'spinning' && (
          <motion.div
            key="spinner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center gap-6 sm:gap-8"
          >
            <div className="text-center">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-game-text mb-1">
                {isX10 ? 'Открытие ×10' : 'Открытие'}
              </h1>
              <p className="text-game-muted text-sm">Следи за стрелкой...</p>
            </div>

            <div className="w-full max-w-3xl">
              <CaseSpinner
                result={spinnerResult.item}
                pool={SPINNER_POOL}
                duration={spinDuration}
                onComplete={handleSpinComplete}
              />
            </div>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center gap-5 sm:gap-8"
          >
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-game-text">
              {isX10 ? `Получено ${results.length} предметов` : 'Результат'}
            </h1>

            <div
              className={`grid gap-3 sm:gap-4 w-full ${
                isX10
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
                  : 'grid-cols-1 justify-items-center'
              }`}
            >
              {results.map((r, i) => {
                const color = RARITY_COLOR[r.item.rarity]
                const isLegendary = r.item.rarity === 'legendary'
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.7, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      delay: isX10 ? i * 0.08 : 0.1,
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                    }}
                    className={`flex flex-col items-center gap-2 sm:gap-3 rounded-2xl p-3 sm:p-4 ${
                      isX10 ? 'w-full' : 'w-40 sm:w-48'
                    }`}
                    style={{
                      backgroundColor: `${color}15`,
                      border: `2px solid ${color}88`,
                      boxShadow: isLegendary ? `0 0 32px ${color}55, 0 0 8px ${color}33` : `0 0 12px ${color}33`,
                    }}
                  >
                    <div
                      className="relative overflow-hidden rounded-xl w-full"
                      style={{ aspectRatio: isX10 ? '2/3' : '3/4' }}
                    >
                      <img
                        src={r.item.svgPath}
                        alt={r.item.nameRu}
                        className="w-full h-full object-contain object-top"
                      />
                      {isLegendary && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.6, 0] }}
                          transition={{ duration: 0.8, delay: isX10 ? i * 0.08 + 0.3 : 0.4 }}
                          className="absolute inset-0 bg-game-gold"
                          style={{ mixBlendMode: 'screen' }}
                        />
                      )}
                    </div>

                    <div className="text-center">
                      <p className="font-heading font-semibold text-xs sm:text-sm leading-tight" style={{ color }}>
                        {r.item.nameRu}
                      </p>
                      <p className="text-[10px] sm:text-xs font-bold mt-0.5" style={{ color }}>
                        {r.item.rarity === 'legendary' ? '✦ LEGENDARY ✦' : r.item.rarity === 'rare' ? '◆ RARE' : '◇ COMMON'}
                      </p>
                      {r.isDuplicate && (
                        <p className="text-[10px] sm:text-xs text-game-muted mt-0.5">+1 Star Power</p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 sm:mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playClick(); navigate('/') }}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-3 text-game-text rounded-xl font-semibold"
                style={{ backgroundColor: 'rgba(33,19,64,0.8)', border: '1px solid rgba(195,98,255,0.3)' }}
              >
                Ещё раз
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playClick(); navigate('/roster') }}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-3 text-white rounded-xl font-semibold"
                style={{ background: 'linear-gradient(135deg, #c362ff, #a040dd)', boxShadow: '0 0 20px rgba(195,98,255,0.35)' }}
              >
                В ростер
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
