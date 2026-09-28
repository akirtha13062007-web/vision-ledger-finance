import { Bell, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'

export function TopBar() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-3 border-b border-[var(--border)] bg-[var(--background)]/90 px-4 backdrop-blur md:px-6">
      <select
        value={language}
        onChange={(event) =>
          setLanguage(event.target.value as 'en' | 'ta')
        }
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-sm outline-none"
        aria-label="Language"
      >
        <option value="en">English</option>
        <option value="ta">தமிழ்</option>
      </select>

      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]"
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <button
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]"
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
      </button>

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] font-bold text-white">
        A
      </div>
    </header>
  )
}