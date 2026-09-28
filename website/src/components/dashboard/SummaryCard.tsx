import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  CreditCard,
  PiggyBank,
} from 'lucide-react'
import { motion } from 'framer-motion'

type SummaryCardProps = {
  title: string
  value: string
  change: string
  positive?: boolean
  type: 'balance' | 'income' | 'expense' | 'savings'
}

const icons = {
  balance: Wallet,
  income: TrendingUp,
  expense: CreditCard,
  savings: PiggyBank,
}

export function SummaryCard({
  title,
  value,
  change,
  positive = true,
  type,
}: SummaryCardProps) {
  const Icon = icons[type]

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[var(--primary)] dark:bg-blue-950/40">
          <Icon size={21} />
        </div>

        <div
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            positive
              ? 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400'
              : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
          }`}
        >
          {positive ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}
          {change}
        </div>
      </div>

      <p className="mt-5 text-sm text-[var(--muted)]">{title}</p>

      <p className="mt-1 text-2xl font-bold tracking-tight">
        {value}
      </p>
    </motion.div>
  )
}