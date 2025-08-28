'use client'
import AuthGuard from '@/components/auth-guard'
import DraggableMiniTimer from '@/components/draggable-mini-timer'
import TimerRestoreButton from '@/components/timer-restore-button'
import { Toaster } from 'sonner'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      {children}
      <DraggableMiniTimer />
      <TimerRestoreButton />
      <Toaster position="top-right" richColors />
    </AuthGuard>
  )
}