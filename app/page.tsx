"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Plus, Waves, Recycle, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Post {
  id: string
  caption: string
  image_url: string
  location: string | null
  waste_type: string[]
  estimated_weight: number | null
  points_earned: number
  created_at: string
  user_id: string
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    level: number
    points: number
  }
  likes: { user_id: string }[]
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect to splash page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/velkommen"
    }
  }, [user, loading])

  const fetchPosts = async () => {
    try {
      setPostsLoading(true)
      setError(null)
      console.log("Fetching posts...")

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (
            id,
            username,
            full_name,
            avatar_url,
            level,
            points
          ),
          likes (user_id)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching posts:", error)
        setError(`Error fetching posts: ${error.message}`)
        return
      }

      console.log("Posts fetched successfully:", data?.length || 0)
      console.log("Sample post data:", data?.[0])
      setPosts(data || [])
    } catch (err: any) {
      console.error("Unexpected error:", err)
      setError(`Unexpected error: ${err.message}`)
    } finally {
      setPostsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user])

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Waves className="w-8 h-8 text-ocean-blue animate-pulse" />
            <Recycle className="w-8 h-8 text-forest-green animate-pulse" />
          </div>
          <p className="text-gray-600">Laster...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header with refresh button */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6 text-ocean-blue" />
            <h1 className="text-lg font-semibold text-gray-900">Hjem</h1>
          </div>
          <button
            onClick={fetchPosts}
            disabled={postsLoading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Oppdater feed"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${postsLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={fetchPosts} className="ml-2 underline">
              Prøv igjen
            </button>
          </div>
        )}

        {/* Posts Loading */}
        {postsLoading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Waves className="w-8 h-8 text-ocean-blue animate-pulse" />
              <Recycle className="w-8 h-8 text-forest-green animate-pulse" />
            </div>
            <p className="text-gray-600">Laster innlegg...</p>
          </div>
        )}

        {/* No Posts */}
        {!postsLoading && posts.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ingen innlegg ennå</h3>
            <p className="text-gray-600 mb-6">Bli den første til å dele en kystopprydding!</p>
            <Link href="/create">
              <Button className="bg-ocean-blue hover:bg-ocean-blue-dark text-white">
                <Plus className="w-4 h-4 mr-2" />
                Opprett første innlegg
              </Button>
            </Link>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
          ))}
        </div>

        {/* Loading more indicator */}
        {postsLoading && posts.length > 0 && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Oppdaterer...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
