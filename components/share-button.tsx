"use client"

import { useState } from "react"
import { Share2, Facebook, Instagram, MessageCircle, Copy, Check } from "lucide-react"

interface ShareButtonProps {
  url?: string
  title?: string
  description?: string
  className?: string
}

export function ShareButton({
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "Skjærgårdshelt - Coastal Cleanup Hero",
  description = "Se hva jeg har gjort for å rydde kysten! Bli med og gjør en forskjell 🌊♻️",
  className = "",
}: ShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareData = {
    title,
    text: description,
    url,
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
        setShowOptions(true)
      }
    } else {
      setShowOptions(true)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.log("Error copying:", error)
    }
  }

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, "_blank", "width=600,height=400")
  }

  const shareToInstagram = () => {
    // Instagram doesn't have direct URL sharing, so we copy the link
    handleCopyLink()
    alert("Link kopiert! Åpne Instagram og lim inn i din story eller post.")
  }

  const shareToSnapchat = () => {
    const snapchatUrl = `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`
    window.open(snapchatUrl, "_blank")
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 text-gray-600 hover:text-[#2D5016] transition-colors p-2 rounded-lg hover:bg-white/50"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm">Del</span>
      </button>

      {showOptions && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border p-3 z-50 min-w-[200px]">
          <div className="flex flex-col gap-2">
            <button
              onClick={shareToFacebook}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Facebook</span>
            </button>

            <button
              onClick={shareToInstagram}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Instagram className="w-5 h-5 text-pink-600" />
              <span className="text-sm">Instagram</span>
            </button>

            <button
              onClick={shareToSnapchat}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">Snapchat</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
              <span className="text-sm">{copied ? "Kopiert!" : "Kopier link"}</span>
            </button>
          </div>

          <button
            onClick={() => setShowOptions(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
