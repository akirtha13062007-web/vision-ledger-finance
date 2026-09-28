import { Plus, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'

type Category = {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
}

export function FloatingActionButton() {
  const { t } = useLanguage()

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return

    const loadCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories')

        if (!response.ok) {
          throw new Error(
            `Failed to load categories (${response.status})`
          )
        }

        const result = await response.json()
        const categoriesData = Array.isArray(result?.data)
          ? result.data
          : []

        const filteredCategories = categoriesData.filter(
          (category: Category) => category.type === type
        )

        setCategories(filteredCategories)

        if (filteredCategories.length > 0) {
          setCategoryId(filteredCategories[0].id)
        } else {
          setCategoryId('')
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
        setError('Unable to load categories.')
      }
    }

    loadCategories()
  }, [open, type])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    if (!categoryId) {
      setError('Please select a category.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/transactions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Number(amount),
            type: type,
            description: description || (type === 'INCOME' ? 'Income' : 'Expense'),
            userId: 'cmtkcqppm0000z48sh1aes087',
            categoryId,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create expense')
      }

      setAmount('')
      setDescription('')
      setCategoryId('')
      setOpen(false)

      window.location.reload()
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save expense.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => {
          setOpen(true)
          setError('')
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-full bg-blue-600 px-6 py-4 font-semibold text-white shadow-2xl"
      >
        <Plus size={20} />
        <span>{t('addExpense')}</span>
      </motion.button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--card)] p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
  Add {type === 'INCOME' ? 'Income' : 'Expense'}
</h2>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Record a new {type === 'INCOME' ? 'income' : 'expense'}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-black/5"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <input
                  type="text"
                  placeholder="e.g. Dinner"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                  <div>
  <label className="mb-2 block text-sm font-medium">
    Type
  </label>

  <select
    value={type}
    onChange={(event) => {
      const newType = event.target.value as 'INCOME' | 'EXPENSE'
      setType(newType)
      setCategoryId('')
    }}
    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none focus:border-[var(--primary)]"
  >
    <option value="EXPENSE">Expense</option>
    <option value="INCOME">Income</option>
  </select>
</div>
                </label>

                <select
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none focus:border-[var(--primary)]"
                >
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                {saving
  ? 'Saving...'
  : `Save ${type === 'INCOME' ? 'Income' : 'Expense'}`}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  )
}