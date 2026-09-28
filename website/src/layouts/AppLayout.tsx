import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { BottomNavigation } from '../components/layout/BottomNavigation'
import { FloatingActionButton } from '../components/layout/FloatingActionButton'
import { TopBar } from '../components/layout/TopBar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <TopBar />

        <main className="min-h-[calc(100vh-4rem)] px-4 pb-24 pt-6 md:px-6 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <BottomNavigation />
      <FloatingActionButton />
    </div>
  )
}