import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabaseAuth } from '../storage/supabaseAuthClient'
import { AuthContext, type AuthContextValue } from './authContext'

function getOAuthRedirectUrl(): string {
  return `${window.location.origin}${window.location.pathname}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(supabaseAuth))

  useEffect(() => {
    if (!supabaseAuth) {
      return undefined
    }

    let isMounted = true

    supabaseAuth.auth.getSession()
      .then(({ data }) => {
        if (isMounted) {
          setSession(data.session)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    const { data: listener } = supabaseAuth.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabaseAuth) {
      throw new Error('Supabase no está configurado.')
    }

    const { error } = await supabaseAuth.auth.signInWithPassword({ email, password })

    if (error) {
      throw new Error(error.message)
    }
  }, [])

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabaseAuth) {
      throw new Error('Supabase no está configurado.')
    }

    const { error } = await supabaseAuth.auth.signUp({ email, password })

    if (error) {
      throw new Error(error.message)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabaseAuth) {
      throw new Error('Supabase no está configurado.')
    }

    const { error } = await supabaseAuth.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getOAuthRedirectUrl(),
      },
    })

    if (error) {
      throw new Error(error.message)
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabaseAuth) {
      return
    }

    const { error } = await supabaseAuth.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    isLoading,
    isConfigured: Boolean(supabaseAuth),
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut,
  }), [isLoading, session, signInWithGoogle, signInWithPassword, signOut, signUpWithPassword])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
