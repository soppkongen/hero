"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Navigation } from "@/components/navigation"
import { Header } from "@/components/header"
import { Trophy, Medal, Award, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface LeaderboardUser {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  points: number
  level: number
  post_count: number
  total_weight: number
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"points" | "weight" | "posts">("points")

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    fetchLeaderboard()
  }, [user, router])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          points,
          level,
          posts (
            estimated_weight
          )
        `)
        .order("points", { ascending: false })
        .limit(50)

      if (error) throw error

      const processedUsers: LeaderboardUser[] = data.map((user: any) => ({
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        points: user.points,
        level: user.level,
        post_count: user.posts.length,
        total_weight: user.posts.reduce((sum: number, post: any) => sum + (post.estimated_weight || 0), 0),
      }))

      setUsers(processedUsers)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSortedUsers = () => {
    switch (activeTab) {
      case "weight":
        return [...users].sort((a, b) => b.total_weight - a.total_weight)
      case "posts":
        return [...users].sort((a, b) => b.post_count - a.post_count)
      default:
        return users // Already sorted by points
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-semibold">{rank}</span>
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

  const getTabValue = (user: LeaderboardUser) => {
    switch (activeTab) {
      case "weight":
        return `${user.total_weight.toFixed(1)} kg`
      case "posts":
        return `${user.post_count} innlegg`
      default:
        return `${user.points} poeng`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Laster toppliste...</p>
      </div>
    )
  }

  const sortedUsers = getSortedUsers()
  const currentUserRank = sortedUsers.findIndex((u) => u.id === user?.id) + 1

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Current User Rank */}
        {currentUserRank > 0 && (
          <div className="card p-4 mb-6 bg-gradient-to-r from-forest-green to-ocean-blue text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Din plassering</p>
                <p className="text-2xl font-bold">#{currentUserRank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">
                  {activeTab === "points" ? "Poeng" : activeTab === "weight" ? "Vekt" : "Innlegg"}
                </p>
                <p className="text-lg font-semibold">{getTabValue(sortedUsers[currentUserRank - 1])}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-6 bg-white/80 backdrop-blur-sm rounded-lg p-1">
          <button
            onClick={() => setActiveTab("points")}
            className={`flex-1 py-2 px-3 text-center text-sm font-medium rounded-md transition-colors ${
              activeTab === "points" ? "bg-forest-green text-white" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Poeng
          </button>
          <button
            onClick={() => setActiveTab("weight")}
            className={`flex-1 py-2 px-3 text-center text-sm font-medium rounded-md transition-colors ${
              activeTab === "weight" ? "bg-forest-green text-white" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Vekt
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-2 px-3 text-center text-sm font-medium rounded-md transition-colors ${
              activeTab === "posts" ? "bg-forest-green text-white" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Innlegg
          </button>
        </div>

        {/* Top 3 Podium */}
        {sortedUsers.length >= 3 && (
          <div className="mb-8">
            <div className="flex items-end justify-center gap-4 mb-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-forest-green to-ocean-blue flex items-center justify-center">
                    {sortedUsers[1].avatar_url ? (
                      <Image
                        src={sortedUsers[1].avatar_url || "/placeholder.svg"}
                        alt={sortedUsers[1].username}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-white text-lg font-bold">
                        {sortedUsers[1].username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2">{getRankIcon(2)}</div>
                </div>
                <p className="text-sm font-medium text-gray-900">{sortedUsers[1].username}</p>
                <p className="text-xs text-gray-600">{getTabValue(sortedUsers[1])}</p>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="relative mb-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                    {sortedUsers[0].avatar_url ? (
                      <Image
                        src={sortedUsers[0].avatar_url || "/placeholder.svg"}
                        alt={sortedUsers[0].username}
                        width={80}
                        height={80}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {sortedUsers[0].username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -top-3 -right-2">{getRankIcon(1)}</div>
                </div>
                <p className="text-sm font-bold text-gray-900">{sortedUsers[0].username}</p>
                <p className="text-xs text-gray-600">{getTabValue(sortedUsers[0])}</p>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-forest-green to-ocean-blue flex items-center justify-center">
                    {sortedUsers[2].avatar_url ? (
                      <Image
                        src={sortedUsers[2].avatar_url || "/placeholder.svg"}
                        alt={sortedUsers[2].username}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-white text-lg font-bold">
                        {sortedUsers[2].username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2">{getRankIcon(3)}</div>
                </div>
                <p className="text-sm font-medium text-gray-900">{sortedUsers[2].username}</p>
                <p className="text-xs text-gray-600">{getTabValue(sortedUsers[2])}</p>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="space-y-2">
          {sortedUsers.map((user, index) => {
            const levelInfo = getLevelInfo(user.level)
            const isCurrentUser = user.id === user?.id

            return (
              <div key={user.id} className={`card p-4 ${isCurrentUser ? "ring-2 ring-forest-green bg-green-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>

                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-forest-green to-ocean-blue flex items-center justify-center">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url || "/placeholder.svg"}
                          alt={user.username}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-white font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${levelInfo.color} border-2 border-white`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.full_name || user.username}
                      {isCurrentUser && <span className="text-forest-green ml-1">(deg)</span>}
                    </p>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-forest-green">{getTabValue(user)}</p>
                    <p className="text-xs text-gray-500">{levelInfo.name}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {sortedUsers.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen brukere ennå</h3>
            <p className="text-gray-600">Bli den første på topplisten!</p>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
