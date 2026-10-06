import { Briefcase, FolderTree, LayoutDashboard, Users, UsersRound, type LucideIcon } from 'lucide-react'
import type { Role } from '@/types'

export interface NavItem {
  to: string
  label: string
  icon?: LucideIcon
  /** Match the path exactly instead of as a prefix. */
  end?: boolean
}

const FIND_JOBS: NavItem = { to: '/jobs', label: 'Find jobs' }

export const GUEST_NAV: NavItem[] = [FIND_JOBS]

/** Links in the top bar for each role. */
export const TOP_NAV: Record<Role, NavItem[]> = {
  seeker: [FIND_JOBS, { to: '/applications', label: 'My applications' }, { to: '/saved', label: 'Saved jobs' }],
  company: [FIND_JOBS, { to: '/company', label: 'Company dashboard' }],
  admin: [FIND_JOBS, { to: '/admin', label: 'Admin' }],
}

export const COMPANY_SIDEBAR: NavItem[] = [
  { to: '/company', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/company/jobs', label: 'My jobs', icon: Briefcase },
  { to: '/company/applicants', label: 'Applicants', icon: UsersRound },
]

export const ADMIN_SIDEBAR: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
]
