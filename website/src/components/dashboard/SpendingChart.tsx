import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Transaction = {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
}

type SpendingData = {
  month: string
  spending: number
}

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function SpendingChart() {
  const [spendingData, setSpendingData] = useState<SpendingData[]>([])
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

        const transactions: Transaction[] = result.data || []
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth()

const monthlySpending = months
  .slice(0, currentMonth + 1)
  .map((month, index) => {
          const spending = transactions
            .filter((transaction) => {
              const transactionDate = new Date(transaction.date)

              return (
                transaction.type === 'EXPENSE' &&
                transactionDate.getMonth() === index &&
                transactionDate.getFullYear() === currentYear
              )
            })
            .reduce(
              (total, transaction) =>
                total + transaction.amount,
              0
            )

          return {
            month,
            spending,
          }
        })

        setSpendingData(monthlySpending)
      } catch (error) {
        console.error(
          'Failed to load spending chart data:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">

      <div className="mb-6">
        <p className="text-lg font-bold">
          Monthly Spending
        </p>

        <p className="text-sm text-[var(--muted)]">
          Your expense activity by month
        </p>
      </div>

      <div className="h-[280px] w-full">

        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            Loading spending data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={spendingData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="spendingFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#4F8EF7"
                    stopOpacity={0.3}
                  />

                  <stop
                    offset="100%"
                    stopColor="#4F8EF7"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'var(--muted)',
                  fontSize: 12,
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'var(--muted)',
                  fontSize: 12,
                }}
                tickFormatter={(value) =>
                  `₹${value / 1000}k`
                }
              />

              <Tooltip
                formatter={(value) =>
                  `₹${Number(value).toLocaleString('en-IN')}`
                }
              />

              <Area
                type="monotone"
                dataKey="spending"
                stroke="#4F8EF7"
                strokeWidth={3}
                fill="url(#spendingFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

      </div>
    </div>
  )
}