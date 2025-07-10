"use client"

import Link from "next/link"
import { Waves, Recycle, Heart, Users, Target, TrendingUp } from "lucide-react"
import { ShareButton } from "@/components/share-button"

export default function WelcomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-blue-400/40 animate-bounce">
          <Waves className="w-8 h-8" />
        </div>
        <div className="absolute top-40 right-16 text-green-400/40 animate-pulse">
          <Recycle className="w-6 h-6" />
        </div>
        <div className="absolute bottom-40 left-20 text-blue-400/40 animate-bounce delay-1000">
          <Heart className="w-5 h-5" />
        </div>
        <div className="absolute top-60 right-8 text-green-400/40 animate-pulse delay-500">
          <Waves className="w-7 h-7" />
        </div>
        <div className="absolute bottom-60 right-24 text-blue-400/40 animate-bounce delay-700">
          <Recycle className="w-4 h-4" />
        </div>
      </div>

      <div className="relative z-10 px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo and branding */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <Waves className="w-8 h-8 text-ocean-blue-light" />
              <span className="text-2xl font-bold logo-text">Skjærgårdshelt</span>
              <Recycle className="w-8 h-8 text-forest-green-light" />
            </div>
          </div>

          {/* Hero section */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Bli en{" "}
              <span className="bg-gradient-to-r from-ocean-blue-light to-forest-green-light bg-clip-text text-transparent">
                Skjærgårdshelt
              </span>
              .
              <br />
              Rydd én strand.
              <br />
              Forandre alt.
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Skjærgårdshelt gjør det synlig, enkelt og gøy å rydde kysten.
              <br />
              Få poeng for innsatsen. Vis verden hva du gjør.
              <br />
              Sammen bygger vi et renere hav – én pose avfall av gangen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/auth"
                className="w-full sm:w-auto bg-gradient-to-r from-forest-green to-ocean-blue text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span className="block sm:hidden">👉 Start nå</span>
                <span className="hidden sm:block">👉 Start nå – lo og behold!</span>
              </Link>

              <ShareButton />
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-ocean-blue to-ocean-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dokumenter innsatsen</h3>
              <p className="text-gray-600 text-sm">
                Ta bilde, registrer sted og type avfall. Vi gjør resten automatisk.
              </p>
            </div>

            <div className="card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-forest-green to-forest-green-light rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Få poeng og nivåer</h3>
              <p className="text-gray-600 text-sm">Jo mer du rydder, jo høyere nivå. Vis verden hvor mye du bidrar.</p>
            </div>

            <div className="card p-6 text-center hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bygg fellesskap</h3>
              <p className="text-gray-600 text-sm">
                Se hva andre gjør, inspirer og bli inspirert. Sammen gjør vi en forskjell.
              </p>
            </div>
          </div>

          {/* Stats section */}
          <div className="card p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sammen har vi allerede:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-forest-green mb-2">🌊</div>
                <div className="text-2xl font-bold text-gray-900">12+</div>
                <div className="text-gray-600">Strender ryddet</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-ocean-blue mb-2">♻️</div>
                <div className="text-2xl font-bold text-gray-900">45+ kg</div>
                <div className="text-gray-600">Avfall samlet</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">👥</div>
                <div className="text-2xl font-bold text-gray-900">25+</div>
                <div className="text-gray-600">Aktive helter</div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="card p-8 bg-gradient-to-r from-forest-green/10 to-ocean-blue/10 border border-forest-green/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Klar til å gjøre en forskjell?</h2>
            <p className="text-gray-700 mb-6">
              Det tar bare 2 minutter å komme i gang. Ingen forpliktelser – bare muligheten til å bidra når du vil.
            </p>
            <Link
              href="/auth"
              className="inline-block bg-gradient-to-r from-forest-green to-ocean-blue text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Bli Skjærgårdshelt nå! 🚀
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Laget med <Heart className="w-4 h-4 inline text-red-500" /> for kysten vår.{" "}
              <Link href="/om" className="text-forest-green hover:underline">
                Les mer om prosjektet
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
