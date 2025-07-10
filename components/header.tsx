"use client"

import Link from "next/link"
import { Waves, Recycle, RefreshCw } from "lucide-react"
import { usePathname } from "next/navigation"
import { MobileMenu } from "@/components/mobile-menu"

interface HeaderProps {
  onRefresh?: () => void
}

export function Header({ onRefresh }: HeaderProps) {
  const pathname = usePathname()

  // Don't show header on splash page
  if (pathname === "/velkommen") return null

  return (
    <header className="sticky top-0 z-50 nav-glass border-b py-3 px-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/" className="logo-container">
          <div className="flex items-center gap-1.5">
            <Waves className="w-6 h-6 text-ocean-blue" />
            <span className="logo-text text-lg">Skjærgårdshelt</span>
            <Recycle className="w-6 h-6 text-forest-green" />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {pathname === "/" && onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Oppdater feed"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
