"use client"

import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Waves, Recycle, Heart, Users, Target, Mail } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="card p-8 mb-6 text-center bg-gradient-to-br from-forest-green/10 to-ocean-blue/10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Waves className="w-8 h-8 text-ocean-blue" />
            <Recycle className="w-8 h-8 text-forest-green" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Skjærgårdshelt</h1>
          <p className="text-gray-600">Sammen gjør vi kysten renere, én strand av gangen</p>
        </div>

        {/* Mission */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-forest-green" />
            <h2 className="text-lg font-semibold text-gray-900">Vårt oppdrag</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Skjærgårdshelt er en plattform som inspirerer og mobiliserer folk til å ta vare på våre vakre kyster. Vi
            tror at små handlinger kan skape store endringer når vi jobber sammen.
          </p>
        </div>

        {/* How it works */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-ocean-blue" />
            <h2 className="text-lg font-semibold text-gray-900">Slik fungerer det</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-forest-green text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Rydd opp</h3>
                <p className="text-sm text-gray-600">Samle søppel langs kysten eller på stranden</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-ocean-blue text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Del opplevelsen</h3>
                <p className="text-sm text-gray-600">Ta bilde og del din opprydding med fellesskapet</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-forest-green text-white flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Inspirer andre</h3>
                <p className="text-sm text-gray-600">Motivér andre til å bli med på å gjøre en forskjell</p>
              </div>
            </div>
          </div>
        </div>

        {/* Impact */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">Vår påvirkning</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-forest-green">500+</div>
              <div className="text-sm text-gray-600">Opprydninger</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ocean-blue">2.5T</div>
              <div className="text-sm text-gray-600">Søppel samlet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-forest-green">150+</div>
              <div className="text-sm text-gray-600">Aktive helter</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ocean-blue">50+</div>
              <div className="text-sm text-gray-600">Strender rengjort</div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-forest-green" />
            <h2 className="text-lg font-semibold text-gray-900">Kontakt oss</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Har du spørsmål, forslag eller vil du samarbeide med oss? Vi hører gjerne fra deg!
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">E-post:</span>
              <span className="text-forest-green">hei@skjaergardshelt.no</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Sosiale medier:</span>
              <span className="text-ocean-blue">@skjaergardshelt</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Laget med 💚 for våre vakre kyster</p>
          <p className="mt-1">Beta versjon 1.0</p>
        </div>
      </main>

      <Navigation />
    </div>
  )
}
