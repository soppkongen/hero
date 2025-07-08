"use client"

import { useState } from "react"
import { Share2, Facebook, Instagram, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ShareButtonProps {
  url: string
  title: string
  description: string
  className?: string
  iconOnly?: boolean
}

export function ShareButton({ url, title, description, className = "", iconOnly = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, "_blank", "width=600,height=400")
  }

  const handleInstagramShare = () => {
    // Instagram doesn't have direct URL sharing, so we copy the link
    handleCopyLink()
    alert("Link kopiert! Lim inn i Instagram Stories eller post.")
  }

  // If native sharing is available, use it directly
  if (navigator.share && !iconOnly) {
    return (
      <Button
        onClick={handleNativeShare}
        variant="ghost"
        size="sm"
        className={`text-gray-600 hover:text-forest-green ${className}`}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Del
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`text-gray-600 hover:text-forest-green ${className}`}>
          <Share2 className="w-4 h-4" />
          {!iconOnly && <span className="ml-2">Del</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleFacebookShare}>
          <Facebook className="w-4 h-4 mr-2 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleInstagramShare}>
          <Instagram className="w-4 h-4 mr-2 text-pink-600" />
          Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Kopiert!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Kopier link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
