import { NavLink, Outlet } from 'react-router'
import { useGameStore } from '@/store/gameStore'
import { playTabSwitch } from '@/lib/sound'

// 16 static sparkles placed around the screen corners/edges
const SPARKLES = [
  { id: 1, top: '8%',  left: '4%',  size: 4, dur: '2.8s', delay: '0s'    },
  { id: 2, top: '15%', left: '92%', size: 6, dur: '3.5s', delay: '0.4s'  },
  { id: 3, top: '35%', left: '2%',  size: 3, dur: '2.2s', delay: '1.1s'  },
  { id: 4, top: '55%', left: '96%', size: 5, dur: '4.1s', delay: '0.7s'  },
  { id: 5, top: '72%', left: '5%',  size: 4, dur: '3.0s', delay: '1.8s'  },
  { id: 6, top: '88%', left: '90%', size: 7, dur: '2.6s', delay: '0.2s'  },
  { id: 7, top: '3%',  left: '55%', size: 3, dur: '3.9s', delay: '1.4s'  },
  { id: 8, top: '92%', left: '30%', size: 5, dur: '2.4s', delay: '0.9s'  },
  { id: 9, top: '22%', left: '18%', size: 3, dur: '3.3s', delay: '2.1s'  },
  { id:10, top: '45%', left: '85%', size: 4, dur: '2.7s', delay: '0.6s'  },
  { id:11, top: '68%', left: '12%', size: 6, dur: '4.5s', delay: '1.6s'  },
  { id:12, top: '80%', left: '70%', size: 3, dur: '3.1s', delay: '2.4s'  },
  { id:13, top: '10%', left: '75%', size: 5, dur: '2.9s', delay: '0.3s'  },
  { id:14, top: '50%', left: '50%', size: 2, dur: '5.0s', delay: '3.0s'  },
  { id:15, top: '30%', left: '95%', size: 4, dur: '3.7s', delay: '1.2s'  },
  { id:16, top: '78%', left: '48%', size: 3, dur: '2.5s', delay: '2.8s'  },
]

function PullsCounter() {
  const pullsAvailable = useGameStore((s) => s.pullsAvailable)
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium">
      <span className="text-game-gold text-base leading-none">✦</span>
      <span className="text-game-text">{pullsAvailable}</span>
      <span className="text-game-muted">/40</span>
    </div>
  )
}

// Desktop nav link
const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'text-game-primary drop-shadow-[0_0_8px_rgba(195,98,255,0.7)]'
      : 'text-game-muted hover:text-game-text'
  }`

// Mobile bottom tab link
const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-0.5 px-5 py-2 transition-all duration-200 ${
    isActive ? 'text-game-primary' : 'text-game-muted'
  }`

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient sparkle dots */}
      {SPARKLES.map((s) => (
        <div
          key={s.id}
          className="sparkle-dot"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            '--duration': s.dur,
            '--delay': s.delay,
          } as React.CSSProperties}
        />
      ))}

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-game-border/60 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="font-heading text-lg font-bold gradient-text">
            ✦ Winx Gacha
          </NavLink>

          {/* Desktop links — hidden on mobile */}
          <div className="hidden sm:flex items-center gap-6">
            <NavLink to="/" className={desktopLinkClass} end onClick={playTabSwitch}>
              Главная
            </NavLink>
            <NavLink to="/roster" className={desktopLinkClass} onClick={playTabSwitch}>
              Ростер
            </NavLink>
            <NavLink to="/collection" className={desktopLinkClass} onClick={playTabSwitch}>
              Коллекция
            </NavLink>
            <div className="h-4 w-px bg-game-border" />
            <PullsCounter />
          </div>

          {/* Mobile: pulls counter in header */}
          <div className="sm:hidden">
            <PullsCounter />
          </div>
        </nav>
      </header>

      {/* ── Main content ── */}
      {/* pb-20 on mobile to clear bottom tab bar */}
      <main className="flex-1 pt-14 pb-20 sm:pb-0 relative z-10">
        <Outlet />
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-game-border/60 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(22,14,46,0.92)' }}
      >
        <NavLink to="/" end className={mobileLinkClass} onClick={playTabSwitch}>
          {({ isActive }) => (
            <>
              <span className="text-xl leading-none">{isActive ? '🏠' : '🏡'}</span>
              <span className="text-[10px] font-medium">Главная</span>
            </>
          )}
        </NavLink>
        <NavLink to="/roster" className={mobileLinkClass} onClick={playTabSwitch}>
          {({ isActive }) => (
            <>
              <span className="text-xl leading-none">{isActive ? '👑' : '🌟'}</span>
              <span className="text-[10px] font-medium">Ростер</span>
            </>
          )}
        </NavLink>
        <NavLink to="/collection" className={mobileLinkClass} onClick={playTabSwitch}>
          {({ isActive }) => (
            <>
              <span className="text-xl leading-none">{isActive ? '💎' : '🔮'}</span>
              <span className="text-[10px] font-medium">Коллекция</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  )
}
