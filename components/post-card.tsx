import { formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import { Heart, MessageCircle, MapPin } from "lucide-react"
import { ShareButton } from "@/components/share-button"

interface PostCardProps {
  post: {
    id: string
    image_url: string
    description: string
    location: string
    waste_type: string
    weight_kg: number
    created_at: string
    likes: number
    user_id: string
    profile?: {
      username: string
      avatar_url?: string
    }
  }
}

export function PostCard({ post }: PostCardProps) {
  const { image_url, description, location, waste_type, weight_kg, created_at, likes, profile } = post

  const formattedDate = formatDistanceToNow(new Date(created_at), {
    addSuffix: true,
    locale: nb,
  })

  const username = profile?.username || "Anonym bruker"
  const avatarUrl = profile?.avatar_url || "/placeholder-user.jpg"

  // Generate share content
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/post/${post.id}`
  const shareTitle = `Skjærgårdshelt: Kystopprydning av ${username}`
  const shareDescription = `Se hva ${username} har gjort for å rydde kysten! ${weight_kg}kg ${waste_type} fjernet fra ${location}. #Skjærgårdshelt #RentHav`

  return (
    <div className="card overflow-hidden mb-4">
      {/* User info */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src={avatarUrl || "/placeholder.svg"} alt={username} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-medium">{username}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500">{formattedDate}</div>
      </div>

      {/* Image */}
      <div className="aspect-square relative">
        <img
          src={image_url || "/placeholder.svg"}
          alt={`Kystopprydning av ${waste_type}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-gray-700 hover:text-red-500 transition-colors">
            <Heart className="w-5 h-5" />
            <span className="text-sm">{likes}</span>
          </button>
          <button className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
        <ShareButton url={shareUrl} title={shareTitle} description={shareDescription} iconOnly />
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{waste_type}</span>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{weight_kg} kg</span>
        </div>
        <p className="text-sm text-gray-700">{description}</p>
      </div>
    </div>
  )
}
