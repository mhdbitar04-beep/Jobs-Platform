import { Link } from 'react-router-dom'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Container } from '@/components/ui/Container'

export function NotFoundPage() {
  return (
    <Container className="flex flex-col items-start py-24">
      <p className="font-display text-7xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 text-3xl font-bold">This page does not exist</h1>
      <p className="mt-2 max-w-md text-ink-600">The link may be out of date, or the address was mistyped.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className={buttonStyles('primary')}>
          Go to the home page
        </Link>
        <Link to="/jobs" className={buttonStyles('secondary')}>
          Browse jobs
        </Link>
      </div>
    </Container>
  )
}
