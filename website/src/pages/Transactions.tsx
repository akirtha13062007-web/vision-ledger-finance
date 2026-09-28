import { useEffect, useMemo, useState } from 'react'

type BackendTransaction = {
  id: string
  amount: number
  description: string | null
  date: string
  type: 'INCOME' | 'EXPENSE'
  category?: {
    name: string
  } | null
}

type Transaction = {
  id: string
  title: string
  category: string
  date: string
  paymentMethod: string
  amount: number
  type: 'income' | 'expense'
}



export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [type, setType] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://localhost:5000/api/transactions'
        )

        if (!response.ok) {
          throw new Error('Failed to fetch transactions')
        }

        const result = await response.json()

        const backendTransactions: BackendTransaction[] =
          result.data || []

        const formattedTransactions: Transaction[] =
          backendTransactions.map((transaction) => ({
            id: transaction.id,
            title: transaction.description || 'Transaction',
            category: transaction.category?.name || 'Others',
            date: new Date(transaction.date).toLocaleDateString(
              'en-IN',
              {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }
            ),
            paymentMethod: 'Not specified',
            amount: Number(transaction.amount),
            type:
              transaction.type === 'INCOME'
                ? 'income'
                : 'expense',
          }))

        setTransactions(formattedTransactions)
      } catch (err) {
        console.error(err)
        setError('Unable to load transactions.')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories')

        if (!response.ok) {
          throw new Error(
            `Failed to load categories (${response.status})`
          )
        }

        const result = await response.json()
        const categoryNames = Array.isArray(result?.data)
          ? result.data.map((category: { name: string }) => category.name)
          : []

        setCategories(['All', ...categoryNames])
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }

    fetchCategories()
  }, [])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchText = search.toLowerCase()

      const matchesSearch =
        transaction.title.toLowerCase().includes(searchText) ||
        transaction.category.toLowerCase().includes(searchText)

      const matchesCategory =
        category === 'All' || transaction.category === category

      const matchesType =
        type === 'All' ||
        transaction.type === type.toLowerCase()

      return matchesSearch && matchesCategory && matchesType
    })
  }, [transactions, search, category, type])

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0)

  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0)

  const balance = totalIncome - totalExpense

 const deleteTransaction = async (id: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this transaction?"
  )

  if (!confirmed) {
    return
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/transactions/${id}`,
      {
        method: "DELETE",
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete transaction")
    }

    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id)
    )
  } catch (error) {
    console.error(error)
    alert("Failed to delete transaction.")
  }
}

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Header */}
      <div>
        <p className="text-sm font-semibold tracking-wide text-[var(--primary)]">
          VISION LEDGER
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Transactions
        </h1>

        <p className="mt-1 text-[var(--muted)]">
          Track and manage your income and expenses.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-6 text-center">
          <p className="text-sm text-[var(--muted)]">
            Loading transactions...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-[18px] border border-red-200 bg-red-50 p-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">

        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">
            Balance
          </p>

          <p className="mt-2 text-2xl font-bold">
            ₹{balance.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">
            Total Income
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            +₹{totalIncome.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">
            Total Expenses
          </p>

          <p className="mt-2 text-2xl font-bold text-red-500">
            -₹{totalExpense.toLocaleString('en-IN')}
          </p>
        </div>

      </div>

      {/* Filters */}
      <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-3">

          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Search
            </label>

            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Type
            </label>

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
            >
              <option value="All">All Transactions</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] shadow-sm">

        <div className="border-b border-[var(--border)] p-5">
          <h2 className="text-lg font-bold">
            Recent Transactions
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {loading ? null : filteredTransactions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-lg font-semibold">
              No transactions found
            </p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">

            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
              >

                {/* Left side */}
                <div className="flex items-center gap-4">

                  <div
                    className={
                      transaction.type === 'income'
                        ? 'flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-lg'
                        : 'flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-lg'
                    }
                  >
                    {transaction.type === 'income' ? '↓' : '↑'}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {transaction.title}
                    </p>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {transaction.category} • {transaction.date}
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {transaction.paymentMethod}
                    </p>
                  </div>

                </div>

                {/* Right side */}
                <div className="flex items-center justify-between gap-5 md:justify-end">

                  <p
                    className={
                      transaction.type === 'income'
                        ? 'text-base font-bold text-green-600'
                        : 'text-base font-bold text-red-500'
                    }
                  >
                    {transaction.type === 'income' ? '+' : '-'}₹
                    {transaction.amount.toLocaleString('en-IN')}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      deleteTransaction(transaction.id)
                    }
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  )
}