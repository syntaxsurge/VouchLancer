import type { ReactNode } from 'react'

import type { Pagination } from './index'

/** Aggregate counts for each credential status shown on candidate dashboards. */
export interface StatusCounts {
  verified: number
  pending: number
  rejected: number
  unverified: number
}

/** Envelope returned by candidate credential listings. */
export interface CredentialsSection {
  rows: any[]
  sort: string
  order: 'asc' | 'desc'
  pagination: Pagination
}

/** Envelope returned by candidate pipeline listings. */
export interface PipelineSection {
  rows: any[]
  sort: string
  order: 'asc' | 'desc'
  pagination: Pagination
  addToPipelineForm?: ReactNode
}

/** Experience highlight rendered in the candidate profile. */
export interface Experience {
  id: number
  title: string
  company: string | null
  type?: string | null
  link?: string | null
  status?: string | null
  createdAt: Date
}

/** Project highlight rendered in the candidate profile. */
export interface Project {
  id: number
  title: string
  link: string | null
  description: string | null
  status?: string | null
  createdAt: Date
}

/** Social links attached to a candidate profile. */
export interface Socials {
  twitterUrl?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  websiteUrl?: string | null
}

/** Snapshot metric block shown in the candidate sidebar card. */
export interface SnapshotMetrics {
  uniqueIssuers: number
  avgScore: number | null
  experienceCount: number
  projectCount: number
}

/** Attributes stored inside issued Skill Pass credentials. */
export interface SkillPassAttributes {
  skillQuiz: string
  score: number
  candidateName: string
}
