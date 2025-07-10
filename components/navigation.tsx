"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, Trophy, User } from "lucide-react"

const navItems = [
  { href: "/", icon: Home, label: "Hjem" },
  { href: "/create", icon: Plus, label: "Opprett" },
  { href: "/leaderboard", icon: Trophy, label: "Toppliste" },
  { href: "/profile", icon: User, label: "Profil" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive ? "text-forest-green bg-green-50" : "text-gray-600 hover:text-forest-green hover:bg-gray-50"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Also export as default for flexibility
export default Navigation
