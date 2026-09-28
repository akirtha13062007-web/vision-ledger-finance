import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { SummaryCard } from '../components/dashboard/SummaryCard'
import { SpendingChart } from '../components/dashboard/SpendingChart'
import { BudgetChart } from '../components/dashboard/BudgetChart'

type Transaction = {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string | null
  date: string
  category?: {
    name: string
  } | null
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/transactions'
        )

        if (!response.ok) {
          throw new Error('Failed to load transactions')
        }

        const result = await response.json()

        setTransactions(result.data || [])
      } catch (error) {
        console.error(
          'Failed to load dashboard transactions:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const currentMonthTransactions = transactions.filter(
    (transaction) => {
      const transactionDate = new Date(transaction.date)

      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      )
    }
  )

  const monthlyIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce(
      (total, transaction) => total + transaction.amount,
      0
    )

  const monthlyExpense = currentMonthTransactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce(
      (total, transaction) => total + transaction.amount,
      0
    )

  const monthlyBalance = monthlyIncome - monthlyExpense

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 5)

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Monthly Balance"
          value={
            loading
              ? 'Loading...'
              : formatCurrency(monthlyBalance)
          }
          change="Current"
          type="balance"
        />

        <SummaryCard
          title="Monthly Income"
          value={
            loading
              ? 'Loading...'
              : formatCurrency(monthlyIncome)
          }
          change="Current"
          type="income"
        />

        <SummaryCard
          title="Monthly Expenses"
          value={
            loading
              ? 'Loading...'
              : formatCurrency(monthlyExpense)
          }
          change="Current"
          positive={false}
          type="expense"
        />

        <SummaryCard
          title="Monthly Savings"
          value={
            loading
              ? 'Loading...'
              : formatCurrency(monthlyBalance)
          }
          change="Current"
          type="savings"
        />

      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <SpendingChart />
        <BudgetChart />
      </div>

      {/* Recent Transactions */}
      <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">

        <div className="mb-5 flex items-center justify-between">
  <div>
    <p className="text-lg font-bold">
      Recent Transactions
    </p>

    <p className="mt-1 text-sm text-[var(--muted)]">
      Your latest income and expenses
    </p>
  </div>

  <button
    onClick={() => {
      window.location.href = '/transactions'
    }}
    className="text-sm font-semibold text-[var(--primary)] hover:underline"
  >
    View All
  </button>
</div>

        {loading ? (
          <div className="py-10 text-center text-sm text-[var(--muted)]">
            Loading transactions...
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="py-10 text-center text-sm text-[var(--muted)]">
            No transactions found.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">

            {recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'INCOME'

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 py-4"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400'
                          : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight size={19} />
                      ) : (
                        <ArrowDownRight size={19} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {transaction.description ||
                          transaction.category?.name ||
                          'Transaction'}
                      </p>

                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {transaction.category?.name ||
                          transaction.type}{' '}
                        • {formatDate(transaction.date)}
                      </p>
                    </div>

                  </div>

                  <p
                    className={`shrink-0 text-sm font-bold ${
                      isIncome
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>

                </div>
              )
            })}

          </div>
        )}

      </div>

    </div>
  )
}