"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { PostCard } from "@/components/post-card"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Waves, Recycle, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Post {
  id: string
  content: string
  image_url: string | null
  location: string | null
  waste_types: string[]
  weight_kg: number | null
  points: number
  created_at: string
  user_id: string
  profiles: {
    id: string
    username: string
    full_name: string
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
        .select(
          `
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
        `,
        )
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching posts:", error)
        setError(`Error fetching posts: ${error.message}`)
        return
      }

      console.log("Posts fetched successfully:", data?.length || 0)
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

  const handleLike = async (postId: string) => {
    if (!user) return

    try {
      // Check if already liked
      const existingLike = posts.find((p) => p.id === postId)?.likes.find((like) => like.user_id === user.id)

      if (existingLike) {
        // Unlike
        await supabase.from("likes").delete().match({
          post_id: postId,
          user_id: user.id,
        })
      } else {
        // Like
        await supabase.from("likes").insert({
          post_id: postId,
          user_id: user.id,
        })
      }

      // Refresh posts to update like counts
      fetchPosts()
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6 text-ocean-blue" />
            <h1 className="text-xl font-bold text-gray-900">Skjærgårdshelt</h1>
            <Recycle className="w-6 h-6 text-forest-green" />
          </div>
          <button
            onClick={fetchPosts}
            disabled={postsLoading}
            className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-6 h-6 ${postsLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-md mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
            <button onClick={fetchPosts} className="ml-2 underline">
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
            <Link href="/create">
              <Button className="bg-ocean-blue hover:bg-ocean-blue-dark text-white">Legg til innlegg</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={user} onLike={() => handleLike(post.id)} />
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
