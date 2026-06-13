import { Dialog, DialogContent } from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import type { GameItem, Character } from '@/types'

const RARITY_COLOR: Record<string, string> = {
  legendary: '#f5d060',
  rare: '#c4aaff',
  common: '#8b87a8',
}

const RARITY_LABEL: Record<string, string> = {
  legendary: '✦ LEGENDARY ✦',
  rare: '◆ RARE',
  common: '◇ COMMON',
}

const TYPE_LABEL: Record<string, string> = {
  character: 'Персонаж',
  outfit: 'Наряд',
  accessory: 'Аксессуар',
  common: 'Обычный предмет',
}

interface Props {
  item: GameItem | null
  count?: number
  open: boolean
  onClose: () => void
}

function isCharacter(item: GameItem): item is Character {
  return item.type === 'character'
}

export function ItemDetailModal({ item, count = 1, open, onClose }: Props) {
  if (!item) return null
  const color = RARITY_COLOR[item.rarity]
  const char = isCharacter(item) ? item : null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden max-w-sm border-0"
        style={{
          background: 'linear-gradient(160deg, #1e1040 0%, #2d1a56 100%)',
          border: `1.5px solid ${color}55`,
          boxShadow: `0 0 40px ${color}22, 0 0 80px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Rarity glow header strip */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />

        <div className="p-4 pb-5 flex flex-col items-center gap-4">
          {/* Image — full width */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              aspectRatio: '3/4',
              backgroundColor: `${color}10`,
              border: `1.5px solid ${color}40`,
              boxShadow: `0 0 32px ${color}33`,
            }}
          >
            <img
              src={item.svgPath}
              alt={item.nameRu}
              className="w-full h-full object-contain object-top p-3"
            />
            {item.rarity === 'legendary' && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 110%, ${color}28 0%, transparent 65%)`,
                }}
              />
            )}
          </motion.div>

          {/* Name */}
          <div className="text-center">
            <h2
              className="font-heading text-2xl font-bold"
              style={{ color }}
            >
              {item.nameRu}
            </h2>
            {item.nameRu !== item.name && (
              <p className="text-game-muted text-sm mt-0.5">{item.name}</p>
            )}
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}50` }}
            >
              {RARITY_LABEL[item.rarity]}
            </span>
            <span
              className="text-xs px-3 py-1 rounded-full text-game-muted"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {TYPE_LABEL[item.type] ?? item.type}
            </span>
            {count > 1 && (
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{ backgroundColor: 'rgba(195,98,255,0.15)', color: '#c362ff', border: '1px solid rgba(195,98,255,0.3)' }}
              >
                ×{count} в коллекции
              </span>
            )}
          </div>

          {/* Character-specific info */}
          {char && (
            <div
              className="w-full rounded-xl px-4 py-3 flex flex-col gap-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {char.element && (
                <div className="flex justify-between text-sm">
                  <span className="text-game-muted">Стихия</span>
                  <span className="text-game-text font-medium">{char.element}</span>
                </div>
              )}
              {char.planet && (
                <div className="flex justify-between text-sm">
                  <span className="text-game-muted">Планета</span>
                  <span className="text-game-text font-medium">{char.planet}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-game-muted text-sm text-center leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Bottom strip */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }}
        />
      </DialogContent>
    </Dialog>
  )
}
