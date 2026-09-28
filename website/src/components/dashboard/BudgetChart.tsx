import { useEffect, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

type Transaction = {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
}

type Budget = {
  amount: number
  month: number
  year: number
}

export function BudgetChart() {
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const now = new Date()
        const month = now.getMonth() + 1
        const year = now.getFullYear()

        const [budgetResponse, transactionsResponse] =
          await Promise.all([
            fetch(
              `http://localhost:5000/api/budgets?month=${month}&year=${year}`
            ),
            fetch('http://localhost:5000/api/transactions'),
          ])

        if (!budgetResponse.ok || !transactionsResponse.ok) {
          throw new Error('Failed to load budget data')
        }

        const budgetResult = await budgetResponse.json()
        const transactionsResult =
          await transactionsResponse.json()

        const budget: Budget | null = budgetResult.data

        const transactions: Transaction[] =
          transactionsResult.data || []

        const spent = transactions
          .filter((transaction) => {
            const transactionDate = new Date(transaction.date)

            return (
              transaction.type === 'EXPENSE' &&
              transactionDate.getMonth() + 1 === month &&
              transactionDate.getFullYear() === year
            )
          })
          .reduce(
            (total, transaction) => total + transaction.amount,
            0
          )

        setTotalBudget(budget?.amount || 0)
        setTotalSpent(spent)
      } catch (error) {
        console.error(
          'Failed to load budget data:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchBudgetData()
  }, [])

  const remaining = Math.max(totalBudget - totalSpent, 0)

  const percentage =
    totalBudget > 0
      ? Math.min(
          Math.round((totalSpent / totalBudget) * 100),
          100
        )
      : 0

  const chartData = [
    { name: 'Spent', value: totalSpent },
    { name: 'Remaining', value: remaining },
  ]

  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-lg font-bold">Budget Overview</p>

        <p className="mt-1 text-sm text-[var(--muted)]">
          This month's spending progress
        </p>
      </div>

      <div className="relative mx-auto h-52 w-full max-w-[230px]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            Loading...
          </div>
        ) : totalBudget === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-[var(--muted)]">
            No budget set for this month
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={70}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  <Cell fill="#4F8EF7" />
                  <Cell fill="#E2E8F0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">
                {percentage}%
              </span>

              <span className="text-xs text-[var(--muted)]">
                used
              </span>
            </div>
          </>
        )}
      </div>

      {!loading && totalBudget > 0 && (
        <div className="mt-3 text-center">
          <p className="text-sm text-[var(--muted)]">
            ₹{totalSpent.toLocaleString('en-IN')} of ₹
            {totalBudget.toLocaleString('en-IN')}
          </p>

          <p className="mt-1 text-sm font-semibold text-green-600">
            ₹{remaining.toLocaleString('en-IN')} remaining
          </p>
        </div>
      )}
    </div>
  )
}