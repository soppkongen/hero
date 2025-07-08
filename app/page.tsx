"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { PostCard } from "@/components/post-card"
import { Navigation } from "@/components/navigation"
import { Waves, Recycle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

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

export default function HomePage() {
  const { user, loading } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }

    if (user) {
      fetchPosts()
    }
  }, [user, loading, router])

  const fetchPosts = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    setError("")

    try {
      console.log("Fetching posts...")

      /* Embedded select now works because the FK exists */
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
            *,
            profiles (
              username,
              avatar_url,
              level
            ),
            likes (
              user_id
            )
          `,
        )
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching posts:", error)
        throw error
      }

      console.log("Posts fetched:", data?.length || 0)
      setPosts(data || [])
    } catch (error: any) {
      console.error("Error fetching posts:", error)
      setError("Kunne ikke laste innlegg")
    } finally {
      setPostsLoading(false)
      setRefreshing(false)
    }
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
  }

  const handleRefresh = () => {
    fetchPosts(true)
  }

  if (loading || postsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Waves className="w-8 h-8 text-[#1E3A8A] animate-pulse" />
            <Recycle className="w-8 h-8 text-[#2D5016] animate-pulse" />
          </div>
          <p className="text-gray-600">Laster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6 text-[#1E3A8A]" />
            <h1 className="text-xl font-bold text-gray-900">Skjærgårdshelt</h1>
            <Recycle className="w-6 h-6 text-[#2D5016]" />
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-6 h-6 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-md mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
            <button onClick={handleRefresh} className="ml-2 underline">
              Prøv igjen
            </button>
          </div>
        )}

        {posts.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Recycle className="w-16 h-16 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen innlegg ennå</h3>
            <p className="text-gray-600 mb-4">Bli den første til å dele en kystopprydning!</p>
            <button onClick={() => router.push("/create")} className="btn-primary">
              Legg til innlegg
            </button>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
