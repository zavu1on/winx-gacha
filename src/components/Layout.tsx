import { NavLink, Outlet } from 'react-router'
import { useGameStore } from '@/store/gameStore'

function PullsCounter() {
  const pullsAvailable = useGameStore((s) => s.pullsAvailable)
  return (
    <div className="flex items-center gap-1 text-sm font-medium text-game-text">
      <span className="text-game-gold">✦</span>
      <span>{pullsAvailable}/40</span>
    </div>
  )
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-game-primary' : 'text-game-muted hover:text-game-text'}`

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-game-bg/90 backdrop-blur-sm border-b border-game-surface">
        <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="font-heading text-lg font-bold text-game-primary">
            Winx Gacha
          </NavLink>
          <div className="flex items-center gap-6">
            <NavLink to="/" className={navLinkClass} end>Главная</NavLink>
            <NavLink to="/roster" className={navLinkClass}>Ростер</NavLink>
            <NavLink to="/collection" className={navLinkClass}>Коллекция</NavLink>
            <PullsCounter />
          </div>
        </nav>
      </header>
      <main className="flex-1 pt-14">
        <Outlet />
      </main>
    </div>
  )
}
