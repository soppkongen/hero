"use client"

import { formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import { Heart, MessageCircle, MapPin, Trash2 } from "lucide-react"
import { ShareButton } from "@/components/share-button"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

interface PostCardProps {
  post: {
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
  onDelete?: (postId: string) => void
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(post.likes.some((like) => like.user_id === user?.id))
  const [likeCount, setLikeCount] = useState(post.likes.length)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    id,
    caption,
    image_url,
    location,
    waste_type,
    estimated_weight,
    points_earned,
    created_at,
    user_id,
    profiles,
  } = post

  const formattedDate = formatDistanceToNow(new Date(created_at), {
    addSuffix: true,
    locale: nb,
  })

  const username = profiles?.username || "Anonym bruker"
  const fullName = profiles?.full_name || username
  const avatarUrl = profiles?.avatar_url
  const userLevel = profiles?.level || 1

  const handleLike = async () => {
    if (!user) return

    try {
      if (isLiked) {
        // Unlike
        await supabase.from("likes").delete().match({
          post_id: id,
          user_id: user.id,
        })
        setIsLiked(false)
        setLikeCount((prev) => prev - 1)
      } else {
        // Like
        await supabase.from("likes").insert({
          post_id: id,
          user_id: user.id,
        })
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleDelete = async () => {
    if (!user || user.id !== user_id || !onDelete) return

    if (!confirm("Er du sikker på at du vil slette dette innlegget?")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id)
      if (error) throw error
      onDelete(id)
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Kunne ikke slette innlegget")
    } finally {
      setIsDeleting(false)
    }
  }

  const getLevelInfo = (level: number) => {
    const levels = {
      1: { name: "Nybegynner", color: "bg-gray-500" },
      2: { name: "Samler", color: "bg-green-500" },
      3: { name: "Helt", color: "bg-blue-500" },
      4: { name: "Mester", color: "bg-purple-500" },
      5: { name: "Legende", color: "bg-yellow-500" },
    }
    return levels[level as keyof typeof levels] || levels[1]
  }

  const levelInfo = getLevelInfo(userLevel)

  // Generate share content
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${id}` : ""
  const shareTitle = `Skjærgårdshelt: Kystopprydning av ${username}`
  const shareDescription = `Se hva ${username} har gjort for å rydde kysten! ${estimated_weight || 0}kg søppel fjernet${location ? ` fra ${location}` : ""}. #Skjærgårdshelt #RentHav`

  return (
    <div className="card overflow-hidden mb-6">
      {/* User info */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forest-green to-ocean-blue flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl || "/placeholder.svg"}
                  alt={username}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-sm">{username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${levelInfo.color} border-2 border-white`}
            />
          </div>
          <div>
            <div className="font-medium text-gray-900">{fullName}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              {location && (
                <>
                  <MapPin className="w-3 h-3" />
                  {location}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">{formattedDate}</div>
          {user?.id === user_id && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Slett innlegg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square relative bg-gray-100">
        <Image
          src={image_url || "/placeholder.svg?height=400&width=400"}
          alt={`Kystopprydning: ${waste_type.join(", ")}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors ${
              isLiked ? "text-red-500" : "text-gray-700 hover:text-red-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm">{likeCount}</span>
          </button>
          <button className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
        <ShareButton url={shareUrl} title={shareTitle} description={shareDescription} iconOnly />
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {waste_type.map((type) => (
            <span key={type} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {type}
            </span>
          ))}
          {estimated_weight && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{estimated_weight} kg</span>
          )}
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">+{points_earned} poeng</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          <span className="font-medium">{username}</span> {caption}
        </p>
      </div>
    </div>
  )
}
