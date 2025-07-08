"use client"

import { Waves, Recycle, Heart, Users, Target, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ShareButton } from "@/components/share-button"

export default function WelcomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-blue-200/30 animate-bounce">
          <Waves className="w-8 h-8" />
        </div>
        <div className="absolute top-40 right-16 text-green-200/30 animate-pulse">
          <Recycle className="w-6 h-6" />
        </div>
        <div className="absolute bottom-40 left-20 text-blue-200/30 animate-bounce delay-1000">
          <Heart className="w-5 h-5" />
        </div>
        <div className="absolute top-60 right-8 text-green-200/30 animate-pulse delay-500">
          <Waves className="w-7 h-7" />
        </div>
        <div className="absolute bottom-60 right-24 text-blue-200/30 animate-bounce delay-700">
          <Recycle className="w-4 h-4" />
        </div>
      </div>

      <div className="relative z-10 px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo and branding */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <Waves className="w-8 h-8 text-blue-600" />
              <Recycle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Hero section */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Bli en{" "}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
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
                className="w-full sm:w-auto bg-gradient-to-r from-[#2D5016] to-[#1E3A8A] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span className="block sm:hidden">👉 Start nå</span>
                <span className="hidden sm:block">👉 Start nå – logg din første ryddeinnsats</span>
              </Link>

              <ShareButton
                url={typeof window !== "undefined" ? window.location.href : ""}
                title="Skjærgårdshelt - Bli en kystopprydningshelt!"
                description="Bli med på Skjærgårdshelt og gjør en forskjell for norsk natur! Rydd kysten, få poeng, og vis verden hva du gjør 🌊♻️🇳🇴"
                className="text-gray-600 hover:text-[#2D5016]"
              />
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="card p-6 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Få poeng for innsatsen</h3>
              <p className="text-gray-600">
                Hver ryddeinnsats gir deg poeng basert på mengde og type avfall. Bygg opp nivået ditt og bli en ekte
                skjærgårdshelt!
              </p>
            </div>

            <div className="card p-6 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Bygg fellesskap</h3>
              <p className="text-gray-600">
                Se hva andre kysthelter gjør rundt om i Norge. Like, kommenter og inspirer hverandre til å gjøre mer.
              </p>
            </div>

            <div className="card p-6 text-center hover:shadow-xl transition-all duration-300 md:col-span-1 lg:col-span-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Vis din påvirkning</h3>
              <p className="text-gray-600">
                Del bilder og historier fra dine ryddeaksjoner. Vis verden hvor mye du har bidratt til et renere hav.
              </p>
            </div>
          </div>

          {/* Stats section */}
          <div className="card p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Sammen gjør vi en forskjell</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-sm text-gray-600">Kysthelter</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">2.5T</div>
                <div className="text-sm text-gray-600">Søppel samlet</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">150+</div>
                <div className="text-sm text-gray-600">Strender ryddet</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">1000+</div>
                <div className="text-sm text-gray-600">Ryddeaksjoner</div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-6">Klar til å bli en del av bevegelsen?</p>
            <Link
              href="/auth"
              className="inline-block bg-gradient-to-r from-[#2D5016] to-[#1E3A8A] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Bli med nå – det tar bare 2 minutter! 🌊
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
