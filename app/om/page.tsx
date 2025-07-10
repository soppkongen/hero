"use client"

import Link from "next/link"
import { Waves, Recycle, Heart, Users, Target, MapPin, Camera, Award, BarChart3, Lightbulb, Mail } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6 text-ocean-blue" />
            <h1 className="text-lg font-semibold text-gray-900">Om Skjærgårdshelt</h1>
            <Recycle className="w-6 h-6 text-forest-green" />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="card p-8 mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Waves className="w-10 h-10 text-ocean-blue-light" />
              <span className="text-3xl font-bold logo-text">Skjærgårdshelt</span>
              <Recycle className="w-10 h-10 text-forest-green-light" />
            </div>
          </div>

          <p className="text-lg text-gray-700 leading-relaxed">
            Skjærgårdshelt er en ny plattform som gjør det enkelt, synlig og meningsfullt å rydde langs kysten.
          </p>

          <p className="text-base text-gray-600 mt-4 leading-relaxed">
            Ved å koble frivillig innsats med teknologi, gir vi vanlige folk – spesielt unge – mulighet til å bidra
            lokalt, bli sett for det de gjør, og samtidig samle verdifulle data om marin forsøpling.
          </p>
        </div>

        {/* Why We Exist */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-ocean-blue to-ocean-blue-light rounded-full flex items-center justify-center">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Hvorfor vi finnes</h2>
          </div>

          <p className="text-gray-700 leading-relaxed mb-4">
            Etter pandemien opplevde mange unge tap av mestring, fellesskap og mulighet til å påvirke. Samtidig står
            Norge – et land med verdens nest lengste kystlinje – overfor en voksende miljøutfordring i form av plast,
            fiskegarn og avfall i skjærgården.
          </p>

          <p className="text-forest-green font-semibold">Skjærgårdshelt ble laget for å forene disse to behovene.</p>
        </div>

        {/* What We Do */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-forest-green to-forest-green-light rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Hva vi gjør</h2>
          </div>

          <p className="text-gray-700 mb-4">Vi gir deg et verktøy for å:</p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Camera className="w-5 h-5 text-ocean-blue mt-1 flex-shrink-0" />
              <p className="text-gray-700">Dokumentere ryddeinnsats og dele det visuelt</p>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-forest-green mt-1 flex-shrink-0" />
              <p className="text-gray-700">Kartlegge hvor og hva som ryddes – automatisk</p>
            </div>

            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Få poeng, nivåer og heder for bidraget ditt</p>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Koble deg til andre som gjør det samme</p>
            </div>

            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">
                Samle data som kan brukes av kommuner, forskere og organisasjoner for å forstå og løse problemet
              </p>
            </div>
          </div>
        </div>

        {/* What Makes Us Unique */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Hva som gjør oss unike</h2>
          </div>

          <p className="text-gray-700 leading-relaxed mb-4">
            Skjærgårdshelt er ikke bare en app. Det er en kulturell plattform for en ny generasjon kystfolk – hvor
            arbeid, fellesskap og miljøansvar smelter sammen.
          </p>

          <p className="text-forest-green font-semibold">
            Vi bygger ikke bare en løsning på søppel – vi bygger en infrastruktur for lokal handlekraft og kollektiv
            synlighet.
          </p>
        </div>

        {/* Who We Are */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Hvem vi er</h2>
          </div>

          <p className="text-gray-700 leading-relaxed mb-4">
            Skjærgårdshelt er startet av initiativtaker <strong>Loke Svendsen</strong> og utvikles i tett dialog med
            unge, frivillige, lokalmiljøer og teknologer.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            Plattformen er 100 % åpen for samarbeid og videreutvikling.
          </p>

          <div className="card p-4 bg-gradient-to-r from-forest-green to-ocean-blue text-white text-center">
            <p className="font-semibold mb-2">Ta kontakt hvis du vil være med!</p>
            <a
              href="mailto:loke@t-pip.no"
              className="flex items-center justify-center gap-2 hover:underline transition-all duration-200 hover:scale-105"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">loke@t-pip.no</span>
            </a>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-6">Klar til å bli en del av bevegelsen?</p>
          <Link
            href="/auth"
            className="inline-block bg-gradient-to-r from-forest-green to-ocean-blue text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Bli med nå! 🌊
          </Link>
        </div>
      </main>

      <Navigation />
    </div>
  )
}
