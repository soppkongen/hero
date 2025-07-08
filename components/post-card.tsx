"use client"

import { useState } from "react"
import { Heart, MessageCircle, MapPin, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { ShareButton } from "./share-button"
import Image from "next/image"

interface Post {
  id: string
  caption: string
  image_url: string
  location: string | null
  waste_type: string[]
  estimated_weight: number | null
  points_earned: number
  created_at: string
  user_id?: string
  profiles: {
    username: string
    avatar_url: string | null
    level: number
  }
  likes: { user_id: string }[]
  _count?: {
    likes: number
  }
}

interface PostCardProps {
  post: Post
  onDelete?: (postId: string) => void
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(post.likes?.some((like) => like.user_id === user?.id) || false)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!user) return

    setLoading(true)
    try {
      if (liked) {
        await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", post.id)

        setLiked(false)
        setLikeCount((prev) => prev - 1)
      } else {
        await supabase.from("likes").insert({
          user_id: user.id,
          post_id: post.id,
        })

        setLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !onDelete) return

    if (confirm("Er du sikker på at du vil slette dette innlegget?")) {
      try {
        await supabase.from("posts").delete().eq("id", post.id)
        onDelete(post.id)
      } catch (error) {
        console.error("Error deleting post:", error)
      }
    }
  }

  const getLevelBadge = (level: number) => {
    const badges = {
      1: { name: "Nybegynner", color: "bg-gray-500" },
      2: { name: "Samler", color: "bg-green-500" },
      3: { name: "Helt", color: "bg-blue-500" },
      4: { name: "Mester", color: "bg-purple-500" },
      5: { name: "Legende", color: "bg-yellow-500" },
    }
    return badges[level as keyof typeof badges] || badges[1]
  }

  const badge = getLevelBadge(post.profiles?.level || 1)
  const canDelete = user?.id === post.user_id

  // Create shareable content
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${post.id}` : ""
  const shareTitle = `${post.profiles?.username} ryddet kysten! 🌊♻️`
  const shareDescription = `Se hva ${post.profiles?.username} har gjort for å rydde kysten! ${post.caption} Bli med på Skjærgårdshelt og gjør en forskjell! 🇳🇴`

  return (
    <div className="card mb-6 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D5016] to-[#1E3A8A] flex items-center justify-center">
              {post.profiles?.avatar_url ? (
                <Image
                  src={post.profiles.avatar_url || "/placeholder.svg"}
                  alt={post.profiles?.username || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <span className="text-white font-semibold">
                  {(post.profiles?.username || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${badge.color} border-2 border-white`} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.profiles?.username || "Unknown User"}</p>
            <p className="text-xs text-gray-500">{badge.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShareButton url={shareUrl} title={shareTitle} description={shareDescription} />
          {canDelete && onDelete && (
            <button onClick={handleDelete} className="text-red-500 hover:text-red-700 p-1">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={post.image_url || "/placeholder.svg?height=400&width=400"}
          alt="Cleanup post"
          fill
          className="object-cover"
        />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-1 ${
              liked ? "text-red-500" : "text-gray-600"
            } hover:text-red-500 transition-colors`}
          >
            <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
            <span className="text-sm">{likeCount}</span>
          </button>

          <button className="text-gray-600 hover:text-gray-800">
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Points and waste info */}
        <div className="flex items-center gap-4 mb-2 text-sm">
          <span className="bg-[#2D5016] text-white px-2 py-1 rounded-full">+{post.points_earned} poeng</span>
          {post.estimated_weight && <span className="text-gray-600">~{post.estimated_weight}kg søppel</span>}
        </div>

        {/* Waste types */}
        {post.waste_type && post.waste_type.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.waste_type.map((type, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Caption */}
        <p className="text-gray-900 mb-2">{post.caption}</p>

        {/* Location */}
        {post.location && (
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{post.location}</span>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-gray-400 text-xs mt-2">
          {new Date(post.created_at).toLocaleDateString("no-NO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  )
}
