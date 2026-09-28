import { FloatingActionButton } from './components/layout/FloatingActionButton'
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useState } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  ScanLine,
  Settings,
  User,
  Wallet,
  X,
} from "lucide-react";

import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import TransactionDetails from "./pages/TransactionDetails";
import Scan from "./pages/Scan";
import Budgets from "./pages/Budgets";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import AIInsights from "./pages/AIInsights";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: Receipt,
  },
  {
    name: "Scan Receipt",
    path: "/scan",
    icon: ScanLine,
  },
  {
    name: "Budgets",
    path: "/budgets",
    icon: Wallet,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    name: "AI Insights",
    path: "/ai-insights",
    icon: Bot,
  },
];

const bottomNavigation = [
  {
    name: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: User,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* MOBILE HEADER */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 hover:bg-[var(--muted-bg)]"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
            <Wallet size={19} />
          </div>

          <span className="font-bold">
            Vision Ledger
          </span>
        </div>

        <div className="w-9" />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen
          border-r border-[var(--border)]
          bg-[var(--card)]
          transition-all duration-300
          ${sidebarOpen ? "w-64" : "w-20"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >

        {/* LOGO */}
        <div className="flex h-20 items-center border-b border-[var(--border)] px-4">

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
              <Wallet size={23} />
            </div>

            {sidebarOpen && (
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">
                  Vision Ledger
                </p>

                <p className="text-xs text-[var(--muted)]">
                  Smart Finance
                </p>
              </div>
            )}
          </div>

          {/* MOBILE CLOSE */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto rounded-lg p-2 hover:bg-[var(--muted-bg)] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* COLLAPSE BUTTON */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-24 hidden h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] shadow-sm lg:flex"
        >
          {sidebarOpen ? (
            <ChevronLeft size={15} />
          ) : (
            <ChevronRight size={15} />
          )}
        </button>

        {/* NAVIGATION */}
        <div className="flex h-[calc(100vh-5rem)] flex-col px-3 py-5">

          <div className="space-y-1">

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `
                    group flex items-center gap-3 rounded-xl px-3 py-3
                    text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-[var(--primary)] text-white shadow-sm"
                        : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
                    }
                    `
                  }
                >
                  <Icon size={20} className="shrink-0" />

                  {sidebarOpen && (
                    <span className="truncate">
                      {item.name}
                    </span>
                  )}

                  {!sidebarOpen && (
                    <span className="pointer-events-none absolute left-16 z-50 hidden rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* DIVIDER */}
          <div className="my-5 border-t border-[var(--border)]" />

          {/* BOTTOM NAVIGATION */}
          <div className="space-y-1">

            {bottomNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `
                    group flex items-center gap-3 rounded-xl px-3 py-3
                    text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-[var(--primary)] text-white shadow-sm"
                        : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
                    }
                    `
                  }
                >
                  <Icon size={20} className="shrink-0" />

                  {sidebarOpen && (
                    <span className="truncate">
                      {item.name}
                    </span>
                  )}

                  {!sidebarOpen && (
                    <span className="pointer-events-none absolute left-16 z-50 hidden rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* LOGOUT */}
          <div className="mt-auto">

            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut size={20} className="shrink-0" />

              {sidebarOpen && (
                <span>
                  Logout
                </span>
              )}

              {!sidebarOpen && (
                <span className="pointer-events-none absolute left-16 z-50 hidden rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                  Logout
                </span>
              )}
            </button>

          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className={`
          min-h-screen pt-16 lg:pt-0
          transition-all duration-300
          ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}
        `}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
            
            <FloatingActionButton />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* AUTHENTICATION */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* MAIN APPLICATION */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/transactions"
              element={<Transactions />}
            />

            <Route
              path="/transactions/:id"
              element={<TransactionDetails />}
            />

            <Route
              path="/scan"
              element={<Scan />}
            />

            <Route
              path="/budgets"
              element={<Budgets />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/ai-insights"
              element={<AIInsights />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/settings"
              element={<SettingsPage />}
            />

          </Route>

          {/* FIRST SCREEN */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* UNKNOWN ROUTES */}
          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
