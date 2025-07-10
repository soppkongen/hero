"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { PostCard } from "@/components/post-card"
import { Navigation } from "@/components/navigation"
import { Header } from "@/components/header"
import { Settings, Trophy, Calendar, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  points: number
  level: number
  created_at: string
}

interface Post {
  id: string
  caption: string
  image_url: string
  location: string | null
  waste_type: string[]
  estimated_weight: number | null
  points_earned: number
  created_at: string
  profiles: {
    username: string
    avatar_url: string | null
    level: number
  }
  likes: { user_id: string }[]
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"posts" | "stats">("posts")

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    fetchProfile()
    fetchUserPosts()
  }, [user, router])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const fetchUserPosts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (
            username,
            avatar_url,
            level
          ),
          likes (
            user_id
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const getLevelInfo = (level: number) => {
    const levels = {
      1: { name: "Nybegynner", color: "bg-gray-500", nextLevel: 50 },
      2: { name: "Samler", color: "bg-green-500", nextLevel: 200 },
      3: { name: "Helt", color: "bg-blue-500", nextLevel: 500 },
      4: { name: "Mester", color: "bg-purple-500", nextLevel: 1000 },
      5: { name: "Legende", color: "bg-yellow-500", nextLevel: null },
    }
    return levels[level as keyof typeof levels] || levels[1]
  }

  const getTotalWeight = () => {
    return posts.reduce((total, post) => total + (post.estimated_weight || 0), 0)
  }

  const getUniqueLocations = () => {
    const locations = posts.map((post) => post.location).filter(Boolean)
    return new Set(locations).size
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Laster profil...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Kunne ikke laste profil</p>
      </div>
    )
  }

  const levelInfo = getLevelInfo(profile.level)

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-forest-green to-ocean-blue flex items-center justify-center">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={profile.username}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">{profile.username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${levelInfo.color} border-2 border-white flex items-center justify-center`}
              >
                <Trophy className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{profile.full_name || profile.username}</h2>
              <p className="text-gray-600">@{profile.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs text-white ${levelInfo.color}`}>{levelInfo.name}</span>
                <span className="text-sm font-semibold text-forest-green">{profile.points} poeng</span>
              </div>
            </div>

            <button onClick={handleSignOut} className="text-gray-600 hover:text-red-600 transition-colors p-2">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {profile.bio && <p className="text-gray-700 mb-4">{profile.bio}</p>}

          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              Medlem siden{" "}
              {new Date(profile.created_at).toLocaleDateString("no-NO", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Level Progress */}
        {levelInfo.nextLevel && (
          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Fremgang til neste nivå</span>
              <span className="text-sm text-gray-500">
                {profile.points}/{levelInfo.nextLevel}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-forest-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((profile.points / levelInfo.nextLevel) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-6 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-2 px-3 text-center text-sm font-medium rounded-md transition-colors ${
              activeTab === "posts" ? "bg-forest-green text-white" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Innlegg ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-2 px-3 text-center text-sm font-medium rounded-md transition-colors ${
              activeTab === "stats" ? "bg-forest-green text-white" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Statistikk
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "posts" ? (
          <div>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="card p-8">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen innlegg ennå</h3>
                  <p className="text-gray-600 mb-4">Del din første kystopprydning!</p>
                  <button
                    onClick={() => router.push("/create")}
                    className="bg-forest-green text-white px-6 py-2 rounded-lg hover:bg-forest-green-dark transition-colors"
                  >
                    Legg til innlegg
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Total vekt samlet</span>
                <span className="font-semibold text-forest-green">{getTotalWeight().toFixed(1)} kg</span>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Antall opprydninger</span>
                <span className="font-semibold text-forest-green">{posts.length}</span>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Unike steder</span>
                <span className="font-semibold text-forest-green">{getUniqueLocations()}</span>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Gjennomsnittlig poeng</span>
                <span className="font-semibold text-forest-green">
                  {posts.length > 0 ? Math.round(profile.points / posts.length) : 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
