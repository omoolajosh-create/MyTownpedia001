import { useEffect, useRef, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)

  const fetchProfile = async (userId: string) => {
    const currentRequest = ++requestId.current
    setLoading(true)
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email, role, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) throw profileError

      const profileIsAdmin = profileData?.role === 'admin'
      const { data: adminCheck, error: roleError } = await supabase
        .rpc('has_role', { _user_id: userId, _role: 'admin' })

      if (currentRequest !== requestId.current) return
      setProfile(profileData)
      setIsAdmin(profileIsAdmin || (!roleError && adminCheck === true))
    } catch (error) {
      if (currentRequest !== requestId.current) return
      console.error('Error fetching profile:', error)
      setProfile(null)
      setIsAdmin(false)
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setIsAdmin(false)
        setLoading(false)
      }
    }

    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user && event !== 'INITIAL_SESSION') {
        fetchProfile(session.user.id)
      } else if (!session?.user) {
        requestId.current += 1
        setProfile(null)
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl, data: { full_name: fullName } },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (!error && data) setProfile(data)
    return { data, error }
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
    isAuthenticated: !!user,
  }
}
