'use client'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import LoginBlock from '@/components/login'   // 👈 import the Tailark block

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')
    const password = String(fd.get('password') || '')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      {/* Wrap your Tailark block in a <form> and connect it */}
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <LoginBlock />
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </form>
    </div>
  )
}
