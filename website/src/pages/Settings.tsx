import { useState } from "react";
import {
  Bell,
  ChevronRight,
  Lock,
  Moon,
  Palette,
  Shield,
  Sun,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 2200);
  };

  const handleDarkMode = () => {
    setTheme(darkMode ? "light" : "dark");
    showMessage(darkMode ? "Light mode enabled" : "Dark mode enabled");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your preferences, notifications, and account security
          </p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <SettingsSection
            icon={Palette}
            title="Appearance"
            description="Customize how Vision Ledger looks"
          >
            <SettingRow
              icon={darkMode ? Moon : Sun}
              title="Dark Mode"
              description="Use a darker interface that's easier on the eyes"
              action={
                <Toggle
                  enabled={darkMode}
                  onChange={handleDarkMode}
                />
              }
            />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            icon={Bell}
            title="Notifications"
            description="Choose which financial updates you want to receive"
          >
            <SettingRow
              icon={Bell}
              title="Email Notifications"
              description="Receive important updates by email"
              action={
                <Toggle
                  enabled={emailNotifications}
                  onChange={() =>
                    setEmailNotifications((current) => !current)
                  }
                />
              }
            />

            <SettingRow
              icon={Wallet}
              title="Budget Alerts"
              description="Get notified when you're approaching a budget limit"
              action={
                <Toggle
                  enabled={budgetAlerts}
                  onChange={() => setBudgetAlerts((current) => !current)}
                />
              }
            />

            <SettingRow
              icon={Wallet}
              title="Transaction Alerts"
              description="Get updates about newly recorded transactions"
              action={
                <Toggle
                  enabled={transactionAlerts}
                  onChange={() =>
                    setTransactionAlerts((current) => !current)
                  }
                />
              }
            />

            <SettingRow
              icon={Bell}
              title="Monthly Reports"
              description="Receive your monthly financial summary"
              action={
                <Toggle
                  enabled={monthlyReports}
                  onChange={() =>
                    setMonthlyReports((current) => !current)
                  }
                />
              }
            />
          </SettingsSection>

          {/* Account */}
          <SettingsSection
            icon={User}
            title="Account"
            description="Manage your account preferences"
          >
            <ActionRow
              icon={User}
              title="Profile"
              description="Update your personal information"
              onClick={() => showMessage("Opening profile...")}
            />

            <ActionRow
              icon={Lock}
              title="Change Password"
              description="Update your account password"
              onClick={() => setShowPasswordModal(true)}
            />
          </SettingsSection>

          {/* Security */}
          <SettingsSection
            icon={Shield}
            title="Privacy & Security"
            description="Keep your financial information protected"
          >
            <SettingRow
              icon={Shield}
              title="Secure Data Storage"
              description="Your financial data is securely stored"
              action={
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Protected
                </span>
              }
            />

            <ActionRow
              icon={Shield}
              title="Privacy Settings"
              description="Control how your data is used"
              onClick={() => showMessage("Privacy settings coming soon")}
            />
          </SettingsSection>

          {/* Danger zone */}
          <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-500/20 dark:bg-slate-900">
            <div className="border-b border-red-100 bg-red-50 px-6 py-5 dark:border-red-500/10 dark:bg-red-500/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <Trash2 size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-red-700 dark:text-red-400">
                    Danger Zone
                  </h2>

                  <p className="mt-1 text-sm text-red-600/70 dark:text-red-400/70">
                    Permanent account actions
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Delete Account
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Permanently delete your account and all associated data.
                  </p>
                </div>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* App information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Vision Ledger
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Personal Finance Management
                </p>
              </div>

              <span className="text-xs text-slate-400 dark:text-slate-500">
                Version 1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change password modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Enter your new password below
                </p>
              </div>

              <button
                onClick={() => setShowPasswordModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <PasswordField label="Current Password" />
              <PasswordField label="New Password" />
              <PasswordField label="Confirm New Password" />
            </div>

            <button
              onClick={() => {
                setShowPasswordModal(false);
                showMessage("Password updated successfully");
              }}
              className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-500/20 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <Trash2 size={21} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
              Delete your account?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              This action cannot be undone. Your account and financial data
              will be permanently removed.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  showMessage("Account deletion will be available after backend integration");
                }}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {message && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-slate-900">
          {message}
        </div>
      )}
    </div>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Palette;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Icon size={18} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {children}
      </div>
    </section>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="shrink-0">{action}</div>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-slate-400"
      />
    </button>
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={enabled}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled
          ? "bg-emerald-500"
          : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function PasswordField({ label }: { label: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type="password"
        placeholder="••••••••"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
    </div>
  );
}