import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/api/supabase'

export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>
  authError: string | null
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      // Check if there's a hash in the URL (from email confirmation)
      const hash = window.location.hash
      const hasHash = hash.length > 0
      
      if (hasHash) {
        // Parse hash parameters
        const hashParams = new URLSearchParams(hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const error = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')
        const type = hashParams.get('type')

        if (error) {
          console.error('Auth error from URL:', error, errorDescription)
          // Set user-friendly error message
          if (error === 'access_denied' && errorDescription?.includes('expired')) {
            setAuthError('This confirmation link has expired. Please request a new confirmation email.')
          } else if (error === 'access_denied') {
            setAuthError('This confirmation link is invalid. Please request a new confirmation email.')
          } else {
            setAuthError(errorDescription || 'An error occurred during email confirmation.')
          }
          // Clean up the URL hash
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
          setLoading(false)
          return
        }

        // If we have tokens, set the session
        if (accessToken && refreshToken) {
          console.log('Setting session from email confirmation, type:', type)
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error('Error setting session:', sessionError)
            setLoading(false)
            // Clean up the URL hash
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
            return
          }

          if (data.session) {
            console.log('Session set successfully, user:', data.session.user?.email)
            setSession(data.session)
            setUser(data.session.user)
            // Clean up the URL hash
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
            setLoading(false)
            return
          }
        }
      }

      // If no hash or hash processing didn't set a session, get existing session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    initializeAuth()

    // Listen for auth changes (this will fire when email confirmation completes)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setAuthError(null)
  }

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    })
    return { error }
  }

  const clearAuthError = () => {
    setAuthError(null)
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resendConfirmation,
    authError,
    clearAuthError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

