'use client'
import AuthGuard from '@/components/auth-guard'
import FloatingMiniTimer from '@/components/floating-mini-timer'
import { Toaster } from 'sonner'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      {children}
      <FloatingMiniTimer />
      <Toaster position="top-right" richColors />
    </AuthGuard>
  )
}