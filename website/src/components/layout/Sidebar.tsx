import {
  BarChart3,
  Bell,
  Bot,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Receipt,
  ScanLine,
  Settings,
  User,
  WalletCards,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

const navigation = [
  { to: '/', label: 'dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'transactions', icon: Receipt },
  { to: '/scan', label: 'scan', icon: ScanLine },
  { to: '/budgets', label: 'budget', icon: WalletCards },
  { to: '/analytics', label: 'analytics', icon: BarChart3 },
  { to: '/reports', label: 'reports', icon: FileText },
  { to: '/insights', label: 'insights', icon: Bot },
  { to: '/notifications', label: 'notifications', icon: Bell },
  { to: '/profile', label: 'profile', icon: User },
  { to: '/settings', label: 'settings', icon: Settings },
  { to: '/help', label: 'help', icon: HelpCircle },
]

export function Sidebar() {
  const { t } = useLanguage()

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-[var(--border)] bg-[var(--card)] lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-[var(--border)] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white">
          V
        </div>

        <div>
          <p className="font-bold tracking-tight">Vision Ledger</p>
          <p className="text-xs text-[var(--muted)]">Smart Finance</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon size={19} />
            {t(label as never)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--muted)] transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800">
          <LogOut size={19} />
          {t('logout')}
        </button>
      </div>
    </aside>
  )
}