"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Plus, Trophy, User, Info, MessageSquare, Waves, Recycle } from "lucide-react"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { href: "/", icon: Home, label: "Hjem", description: "Se alle innlegg fra fellesskapet" },
    { href: "/create", icon: Plus, label: "Opprett", description: "Del din kystopprydding" },
    { href: "/leaderboard", icon: Trophy, label: "Toppliste", description: "Se hvem som bidrar mest" },
    { href: "/profile", icon: User, label: "Profil", description: "Din profil og statistikk" },
    { href: "/om", icon: Info, label: "Om oss", description: "Les mer om Skjærgårdshelt" },
    { href: "/feedback", icon: MessageSquare, label: "Tilbakemelding", description: "Gi oss din feedback" },
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Menu className="w-6 h-6 text-gray-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-white">
        <SheetHeader className="border-b border-gray-200 pb-4">
          <SheetTitle className="flex items-center gap-2 text-left">
            <Waves className="w-6 h-6 text-ocean-blue" />
            <span className="font-bold text-gray-900">Skjærgårdshelt</span>
            <Recycle className="w-6 h-6 text-forest-green" />
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-6">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    isActive ? "bg-forest-green text-white" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${isActive ? "text-white" : "text-gray-900"}`}>{item.label}</div>
                    <div className={`text-sm ${isActive ? "text-white/80" : "text-gray-500"}`}>{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gradient-to-r from-forest-green/10 to-ocean-blue/10 rounded-lg p-4 border border-forest-green/20">
            <div className="text-center">
              <div className="text-2xl mb-2">🌊♻️</div>
              <p className="text-sm text-gray-600 mb-3">Sammen gjør vi kysten renere, én strand av gangen!</p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span>Beta v1.0</span>
                <span>•</span>
                <span>Made with 💚</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
