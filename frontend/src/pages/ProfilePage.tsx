import { PasswordForm } from '@/components/profile/PasswordForm'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ResumeCard } from '@/components/profile/ResumeCard'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAuth } from '@/context/auth-context'

export function ProfilePage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <PageHeader title="Profile" description="Keep your details current." />
      <div className="space-y-6">
        <ProfileForm user={user} />
        {user.role === 'seeker' && <ResumeCard user={user} />}
        <PasswordForm />
      </div>
    </Container>
  )
}
