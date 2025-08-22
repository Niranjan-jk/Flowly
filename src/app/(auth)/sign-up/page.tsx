'use client'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import SignUpBlock from '@/components/sign-up'

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')
    const password = String(fd.get('password') || '')

    console.log('SIGNUP form values:', { email, password }) // 👈 debug line

    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      console.error(error)
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={onSubmit} className="min-h-dvh">
      <SignUpBlock />
      {error && <p className="text-red-400 text-center mt-2">{error}</p>}
    </form>
  )
}
