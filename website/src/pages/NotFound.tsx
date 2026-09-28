import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold">404</h1>

      <p className="mt-3 text-[var(--muted)]">
        The page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold text-white"
      >
        Back to Dashboard
      </Link>
    </section>
  )
}