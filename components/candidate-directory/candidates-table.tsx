'use client'

import Link from 'next/link'
import * as React from 'react'

import { DataTable, type Column } from '@/components/ui/tables/data-table'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useTableNavigation } from '@/lib/hooks/use-table-navigation'
import type { CandidateDirectoryRow, TableProps } from '@/lib/types/tables'

/* -------------------------------------------------------------------------- */
/*                             T A B L E   V I E W                            */
/* -------------------------------------------------------------------------- */

export default function CandidatesTable({
  rows,
  sort,
  order,
  basePath,
  initialParams,
  searchQuery,
}: TableProps<CandidateDirectoryRow>) {
  const { search, handleSearchChange, sortableHeader } = useTableNavigation({
    basePath,
    initialParams,
    sort,
    order,
    searchQuery,
  })

  const columns = React.useMemo<Column<CandidateDirectoryRow>[]>(() => {
    return [
      {
        key: 'name',
        header: sortableHeader('Name', 'name'),
        sortable: false,
        render: (v: unknown, row: CandidateDirectoryRow) => {
          const displayName = typeof v === 'string' && v.trim().length > 0 ? v : 'Unnamed'
          return (
            <Link href={`/candidates/${row.id}`} className='flex items-center gap-2 truncate'>
              <UserAvatar className='h-8 w-8' name={displayName} />
              <span className='truncate'>{displayName}</span>
            </Link>
          )
        },
      },
      {
        key: 'email',
        header: sortableHeader('Email', 'email'),
        sortable: false,
        render: (v) => <span className='truncate'>{v as string}</span>,
      },
      {
        key: 'verified',
        header: sortableHeader('Verified', 'verified'),
        sortable: false,
        render: (v) =>
          v ? (
            <span className='rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'>
              Yes
            </span>
          ) : (
            <span className='rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600'>
              No
            </span>
          ),
      },
    ]
  }, [sortableHeader])

  return (
    <div className='min-w-[640px]'>
      <DataTable
        columns={columns}
        rows={rows}
        filterKey='name'
        filterValue={search}
        onFilterChange={handleSearchChange}
      />
    </div>
  )
}
