import { Users } from 'lucide-react'

import CandidatesTable from '@/components/candidate-directory/candidates-table'
import PageCard from '@/components/ui/page-card'
import { TablePagination } from '@/components/ui/tables/table-pagination'
import { getCandidateListingPage } from '@/lib/db/queries/candidates-core'
import type { CandidateDirectoryRow } from '@/lib/types/tables'
import { getTableParams, resolveSearchParams, type Query } from '@/lib/utils/query'

export const revalidate = 0

export default async function CandidateDirectoryPage({
  searchParams,
}: {
  searchParams?: Promise<Query>
}) {
  const params = await resolveSearchParams(searchParams)

  const { page, pageSize, sort, order, searchTerm, initialParams } = getTableParams(
    params,
    ['name', 'email', 'verified'] as const,
    'name',
  )

  const termLower = searchTerm.toLowerCase()

  const { candidates, hasNext } = await getCandidateListingPage(
    page,
    pageSize,
    sort as 'name' | 'email' | 'verified',
    order,
    termLower,
  )

  const rows: CandidateDirectoryRow[] = candidates.map((c) => ({
    id: c.id,
    userId: c.userId,
    name: c.name,
    email: c.email,
    verified: c.verified,
  }))

  return (
    <PageCard
      icon={Users}
      title='Candidate Directory'
      description='Browse public candidate profiles. Use the search box, sortable headers and pagination controls to find talent quickly.'
    >
      <div className='space-y-4 overflow-x-auto'>
        <CandidatesTable
          rows={rows}
          sort={sort}
          order={order}
          basePath='/candidates'
          initialParams={initialParams}
          searchQuery={searchTerm}
        />

        <TablePagination
          page={page}
          hasNext={hasNext}
          basePath='/candidates'
          initialParams={initialParams}
          pageSize={pageSize}
        />
      </div>
    </PageCard>
  )
}
