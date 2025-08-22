'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) router.replace('/login')
      else setLoading(false)
    })()
  }, [router])

  if (loading) return null
  return <>{children}</>
}
