"use client"

import { Home, Plus, Trophy, User, Info } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  // Don't show navigation on splash page
  if (pathname === "/velkommen") return null

  const navItems = [
    { href: "/", icon: Home, label: "Hjem" },
    { href: "/create", icon: Plus, label: "Legg til" },
    { href: "/leaderboard", icon: Trophy, label: "Toppliste" },
    { href: "/profile", icon: User, label: "Profil" },
    { href: "/om", icon: Info, label: "Om oss" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 nav-glass border-t z-50 px-2 py-2 safe-area-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0 ${
                isActive
                  ? "text-forest-green bg-forest-green/10 font-medium"
                  : "text-gray-600 hover:text-forest-green hover:bg-forest-green/5"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
