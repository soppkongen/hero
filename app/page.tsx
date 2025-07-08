"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Plus, Waves, Recycle } from "lucide-react"
import Link from "next/link"

interface Post {
  id: string
  caption: string
  image_url: string | null
  location: string | null
  waste_type: string[]
  estimated_weight: number | null
  points_earned: number
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
            <PostCard key={post.id} post={post} onDelete={(postId) => setPosts(posts.filter((p) => p.id !== postId))} />
          ))}
        </div>
      </main>
    </div>
  )
}
