import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const linkStyles = 'text-sm text-brand-100 hover:text-white'

export function Footer() {
  return (
    <footer className="mt-20 bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr] sm:px-6">
        <div>
          <Logo inverted />
          <p className="mt-3 max-w-xs text-sm text-brand-200">
            Open roles from companies that are hiring now, and one place to follow every application you send.
          </p>
        </div>
        <nav aria-label="For job seekers" className="flex flex-col gap-2">
          <h2 className="mb-1 font-sans text-sm font-semibold text-white">For job seekers</h2>
          <Link to="/jobs" className={linkStyles}>
            Find jobs
          </Link>
          <Link to="/applications" className={linkStyles}>
            My applications
          </Link>
          <Link to="/saved" className={linkStyles}>
            Saved jobs
          </Link>
        </nav>
        <nav aria-label="For companies" className="flex flex-col gap-2">
          <h2 className="mb-1 font-sans text-sm font-semibold text-white">For companies</h2>
          <Link to="/register?role=company" className={linkStyles}>
            Create a company account
          </Link>
          <Link to="/company/jobs/new" className={linkStyles}>
            Post a job
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-brand-300 sm:px-6">
          Jobs Platform. A portfolio project built with Laravel and React.
        </p>
      </div>
    </footer>
  )
}
