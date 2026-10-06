import { Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GuestOnly, RequireAuth } from '@/components/layout/guards'
import { ADMIN_SIDEBAR, COMPANY_SIDEBAR } from '@/components/layout/navigation'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminJobsPage } from '@/pages/admin/AdminJobsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { AllApplicantsPage } from '@/pages/company/AllApplicantsPage'
import { CompanyDashboardPage } from '@/pages/company/CompanyDashboardPage'
import { CompanyJobsPage } from '@/pages/company/CompanyJobsPage'
import { JobApplicantsPage } from '@/pages/company/JobApplicantsPage'
import { EditJobPage, NewJobPage } from '@/pages/company/JobFormPage'
import { HomePage } from '@/pages/HomePage'
import { JobDetailPage } from '@/pages/JobDetailPage'
import { JobsPage } from '@/pages/JobsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ApplicationsPage } from '@/pages/seeker/ApplicationsPage'
import { SavedJobsPage } from '@/pages/seeker/SavedJobsPage'

export function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<RequireAuth roles={['seeker']} />}>
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/saved" element={<SavedJobsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<RequireAuth roles={['company']} />}>
        <Route path="/company" element={<DashboardLayout title="Company" items={COMPANY_SIDEBAR} />}>
          <Route index element={<CompanyDashboardPage />} />
          <Route path="jobs" element={<CompanyJobsPage />} />
          <Route path="jobs/new" element={<NewJobPage />} />
          <Route path="jobs/:id/edit" element={<EditJobPage />} />
          <Route path="jobs/:id/applicants" element={<JobApplicantsPage />} />
          <Route path="applicants" element={<AllApplicantsPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['admin']} />}>
        <Route path="/admin" element={<DashboardLayout title="Admin" items={ADMIN_SIDEBAR} />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
