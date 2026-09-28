import {
  BarChart3,
  Bot,
  LayoutDashboard,
  Receipt,
  ScanLine,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

const items = [
  { to: '/', label: 'dashboard', icon: LayoutDashboard },
  { to: '/scan', label: 'scan', icon: ScanLine },
  { to: '/transactions', label: 'transactions', icon: Receipt },
  { to: '/budgets', label: 'budget', icon: BarChart3 },
  { to: '/insights', label: 'insights', icon: Bot },
]

export function BottomNavigation() {
  const { t } = useLanguage()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium ${
                isActive
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted)]'
              }`
            }
          >
            <Icon size={20} />
            {t(label as never)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}