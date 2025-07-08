"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ user: User | null; error: any }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log("Attempting to sign up user:", email)

      // Validate inputs
      if (!email || !password || !username) {
        throw new Error("Alle felter er påkrevd")
      }

      if (password.length < 6) {
        throw new Error("Passordet må være minst 6 tegn")
      }

      // Clean email
      const cleanEmail = email.trim().toLowerCase()

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: username.trim(),
            full_name: username.trim(),
          },
        },
      })

      if (error) {
        console.error("Supabase signup error:", error)
        throw error
      }

      console.log("Signup successful:", data)
      return { user: data.user, error: null }
    } catch (error: any) {
      console.error("Sign up error:", error)
      return { user: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in user:", email)

      // Clean email
      const cleanEmail = email.trim().toLowerCase()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        console.error("Supabase signin error:", error)
        throw error
      }

      console.log("Signin successful:", data)
      return { user: data.user, error: null }
    } catch (error: any) {
      console.error("Sign in error:", error)
      return { user: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
