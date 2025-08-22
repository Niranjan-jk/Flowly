'use client'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import ForgotPasswordBlock from '@/components/forgot-password'

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null); setMessage(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/update-password`
    })

    if (error) setError(error.message)
    else setMessage('Check your email for a reset link!')
  }

  return (
    <form onSubmit={onSubmit} className="min-h-dvh">
      <ForgotPasswordBlock />
      {error && <p className="text-red-400 text-center mt-2">{error}</p>}
      {message && <p className="text-green-400 text-center mt-2">{message}</p>}
    </form>
  )
}
