"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, isValidEmail, generateTestEmail } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  createTestUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
        }
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Session error:", error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase()

    if (!isValidEmail(cleanEmail)) {
      throw new Error("Ugyldig e-postformat")
    }

    console.log("Attempting to sign in with:", cleanEmail)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password.trim(),
    })

    if (error) {
      console.error("Sign in error:", error)
      let errorMessage = "Pålogging feilet"

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Ugyldig e-post eller passord"
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "E-post ikke bekreftet"
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "For mange forsøk. Prøv igjen senere"
      }

      throw new Error(errorMessage)
    }

    console.log("Sign in successful:", data.user?.email)
  }

  const signUp = async (email: string, password: string, username: string) => {
    const cleanEmail = email.trim().toLowerCase()
    const cleanUsername = username.trim()
    const cleanPassword = password.trim()

    // Validation
    if (!isValidEmail(cleanEmail)) {
      throw new Error("Ugyldig e-postformat")
    }

    if (cleanPassword.length < 6) {
      throw new Error("Passord må være minst 6 tegn")
    }

    if (cleanUsername.length < 2) {
      throw new Error("Brukernavn må være minst 2 tegn")
    }

    console.log("Attempting to sign up with:", cleanEmail, cleanUsername)

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          username: cleanUsername,
          full_name: cleanUsername,
        },
      },
    })

    if (error) {
      console.error("Sign up error:", error)
      let errorMessage = "Registrering feilet"

      if (error.message.includes("User already registered")) {
        errorMessage = "Bruker eksisterer allerede"
      } else if (error.message.includes("Password should be at least")) {
        errorMessage = "Passord er for svakt"
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "Ugyldig e-postadresse"
      }

      throw new Error(errorMessage)
    }

    console.log("Sign up successful:", data.user?.email)

    // If user is created but not confirmed, create profile anyway
    if (data.user && !data.session) {
      console.log("User created but needs email confirmation")
    }
  }

  const createTestUser = async () => {
    const testEmail = generateTestEmail()
    const testPassword = "testpassword123"
    const testUsername = "kystopprydder"

    console.log("Creating test user with email:", testEmail)

    try {
      await signUp(testEmail, testPassword, testUsername)
      // If signup succeeds, try to sign in
      await signIn(testEmail, testPassword)
    } catch (error: any) {
      console.error("Test user creation failed:", error)
      throw new Error(`Kunne ikke opprette testbruker: ${error.message}`)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out error:", error)
      throw new Error("Utlogging feilet")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, createTestUser }}>
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
