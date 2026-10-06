import { ExternalLink } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import type { Company } from '@/types'

export function CompanyCard({ company }: { company: Company }) {
  const facts = [company.industry, company.location, company.size && `${company.size} people`].filter(Boolean)

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <Avatar name={company.name} shape="square" />
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{company.name}</h2>
          {facts.length > 0 && <p className="text-sm text-ink-500">{facts.join(', ')}</p>}
        </div>
      </div>
      {company.description && <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-ink-700">{company.description}</p>}
      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800"
        >
          Visit website
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      )}
    </Card>
  )
}
