"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Waves, Recycle, User, AlertCircle } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { signIn, signUp, createTestUser } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (isLogin) {
        await signIn(email, password)
        router.push("/")
      } else {
        await signUp(email, password, username)
        setSuccess("Bruker opprettet! Du kan nå logge inn.")
        setIsLogin(true)
        setPassword("")
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      setError(err.message || "En feil oppstod")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTestUser = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await createTestUser()
      setSuccess("Testbruker opprettet og logget inn!")
      router.push("/")
    } catch (err: any) {
      console.error("Test user creation error:", err)
      setError(err.message || "Kunne ikke opprette testbruker")
    } finally {
      setLoading(false)
    }
  }

  const fillTestCredentials = () => {
    setEmail("test@example.com")
    setPassword("testpassword123")
    setUsername("kystopprydder")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-green to-ocean-blue flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Waves className="w-8 h-8 text-ocean-blue" />
            <Recycle className="w-8 h-8 text-forest-green" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Skjærgårdshelt</h1>
          <p className="text-gray-600 mt-2">{isLogin ? "Velkommen tilbake!" : "Bli en kystopprydningshelt!"}</p>
        </div>

        {/* Quick Test User Button */}
        <div className="mb-6">
          <button
            onClick={handleCreateTestUser}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            {loading ? "Oppretter testbruker..." : "Opprett ny testbruker"}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">Oppretter automatisk en testbruker med unik e-post</p>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">eller</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Brukernavn
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                required={!isLogin}
                minLength={2}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-post
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              placeholder="din@epost.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Passord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              minLength={6}
              placeholder="Minst 6 tegn"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Laster..." : isLogin ? "Logg inn" : "Registrer deg"}
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <button onClick={() => setIsLogin(!isLogin)} className="text-forest-green hover:underline text-sm block">
            {isLogin ? "Har du ikke konto? Registrer deg" : "Har du allerede konto? Logg inn"}
          </button>

          {!isLogin && (
            <button onClick={fillTestCredentials} className="text-gray-500 hover:text-gray-700 text-xs">
              Fyll inn testdata
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
