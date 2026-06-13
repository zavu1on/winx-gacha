import { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import type { GameItem } from '@/types'

const CARD_W = 116
const CARD_H = 156
const CARD_GAP = 8
const CARD_STEP = CARD_W + CARD_GAP
const STRIP_COUNT = 60
const RESULT_IDX = 47

const RARITY_COLOR: Record<string, string> = {
  legendary: '#ffd700',
  rare: '#a78bfa',
  common: '#6b7280',
}

interface CaseSpinnerProps {
  result: GameItem
  pool: GameItem[]
  duration?: number
  onComplete: () => void
}

export function CaseSpinner({ result, pool, duration = 4.5, onComplete }: CaseSpinnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const cards = useMemo(() => {
    const arr: GameItem[] = []
    for (let i = 0; i < STRIP_COUNT; i++) {
      if (i === RESULT_IDX) {
        arr.push(result)
      } else {
        arr.push(pool[Math.floor(Math.random() * pool.length)])
      }
    }
    return arr
  }, [result, pool])

  useEffect(() => {
    const container = containerRef.current
    const strip = stripRef.current
    if (!container || !strip) return

    const containerW = container.offsetWidth
    const startX = containerW / 2 - 6 * CARD_STEP - CARD_W / 2
    const variance = (Math.random() - 0.5) * 40
    const endX = containerW / 2 - RESULT_IDX * CARD_STEP - CARD_W / 2 + variance

    gsap.set(strip, { x: startX })

    const tl = gsap.timeline()
    tl.to(strip, {
      x: endX,
      duration,
      ease: 'power4.out',
      onComplete,
    })

    return () => { tl.kill() }
  }, [cards, duration, onComplete])

  const color = RARITY_COLOR[result.rarity]

  return (
    // On mobile, scale the whole spinner down so it fits without clipping
    <div className="w-full relative select-none overflow-hidden"
      style={{ touchAction: 'none' }}>
      {/* Top pointer */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-0 h-0"
        style={{
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `16px solid ${color}`,
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />

      {/* Strip container */}
      <div
        ref={containerRef}
        className="overflow-hidden relative rounded-xl"
        style={{ height: CARD_H + 16, border: `1px solid rgba(195,98,255,0.25)`, borderRadius: '1rem' }}
      >
        {/* Fade masks */}
        <div
          className="absolute inset-y-0 left-0 w-28 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #160e2e ee, transparent)' }}
        />
        <div
          className="absolute inset-y-0 right-0 w-28 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #160e2e ee, transparent)' }}
        />

        {/* Center highlight bar */}
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          style={{
            width: CARD_W + 4,
            borderLeft: `2px solid ${color}`,
            borderRight: `2px solid ${color}`,
            boxShadow: `0 0 20px ${color}66, inset 0 0 20px ${color}11`,
          }}
        />

        {/* Scrolling strip */}
        <div
          ref={stripRef}
          className="absolute top-2 flex"
          style={{ gap: CARD_GAP, willChange: 'transform' }}
        >
          {cards.map((item, i) => {
            const c = RARITY_COLOR[item.rarity]
            const isResult = i === RESULT_IDX
            return (
              <div
                key={i}
                className="shrink-0 flex flex-col items-center justify-between rounded-lg py-2 px-1"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  backgroundColor: isResult ? `${c}22` : `${c}0d`,
                  border: `1.5px solid ${isResult ? c : c + '55'}`,
                  boxShadow: isResult ? `0 0 12px ${c}55` : 'none',
                }}
              >
                <img
                  src={item.svgPath}
                  alt={item.nameRu}
                  className="w-full flex-1 object-contain min-h-0"
                  style={{ maxHeight: 96 }}
                  draggable={false}
                />
                <div className="text-center mt-1 px-1">
                  <p className="text-[10px] leading-tight text-game-text line-clamp-2">{item.nameRu}</p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: c }}>
                    {item.rarity === 'legendary' ? '★★★' : item.rarity === 'rare' ? '★★' : '★'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom pointer */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-0 h-0"
        style={{
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: `16px solid ${color}`,
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
    </div>
  )
}
