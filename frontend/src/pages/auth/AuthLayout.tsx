import type { ReactNode } from 'react'
import { Logo } from '@/components/layout/Logo'

interface AuthLayoutProps {
  title: string
  subtitle: ReactNode
  children: ReactNode
}

/** Login and register share this split screen: the form, and a quiet brand panel on wide screens. */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_28rem] xl:grid-cols-[1fr_34rem]">
      <main className="flex flex-col bg-white px-4 py-8 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-ink-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
      <aside className="hidden flex-col justify-end bg-brand-800 p-12 text-white lg:flex">
        <p className="font-display text-4xl leading-tight font-bold">Apply once. Know where you stand.</p>
        <p className="mt-4 max-w-sm text-brand-100">
          Every application shows its status, and you get a notification the moment a company moves it forward.
        </p>
      </aside>
    </div>
  )
}
