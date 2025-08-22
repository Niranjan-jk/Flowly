'use client'
import AuthGuard from '@/components/auth-guard'
import { Toaster } from 'sonner'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      {children}
      <Toaster position="top-right" richColors />
    </AuthGuard>
  )
}