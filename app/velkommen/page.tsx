import type { Metadata } from "next"
import Link from "next/link"
import { Waves, Recycle, Users, Trophy, MapPin, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Bli en Skjærgårdshelt - Rydd én strand. Forandre alt.",
  description:
    "Skjærgårdshelt gjør det synlig, enkelt og gøy å rydde kysten. Få poeng for innsatsen. Vis verden hva du gjør. Sammen bygger vi et renere hav – én pose avfall av gangen.",
  openGraph: {
    title: "Bli en Skjærgårdshelt - Rydd én strand. Forandre alt.",
    description:
      "Skjærgårdshelt gjør det synlig, enkelt og gøy å rydde kysten. Få poeng for innsatsen. Vis verden hva du gjør. Sammen bygger vi et renere hav – én pose avfall av gangen.",
    url: "https://skjaergardshelt.vercel.app/velkommen",
    siteName: "Skjærgårdshelt",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Skjærgårdshelt - Coastal cleanup heroes",
      },
    ],
    locale: "no_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bli en Skjærgårdshelt - Rydd én strand. Forandre alt.",
    description:
      "Skjærgårdshelt gjør det synlig, enkelt og gøy å rydde kysten. Få poeng for innsatsen. Vis verden hva du gjør.",
    images: ["/og-image.png"],
  },
}

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-blue via-ocean-blue-light to-forest-green">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-pulse">
            <Waves className="w-16 h-16 text-white" />
          </div>
          <div className="absolute top-32 right-20 animate-pulse delay-1000">
            <Recycle className="w-12 h-12 text-white" />
          </div>
          <div className="absolute bottom-20 left-20 animate-pulse delay-2000">
            <Heart className="w-14 h-14 text-white" />
          </div>
          <div className="absolute bottom-32 right-10 animate-pulse delay-500">
            <MapPin className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Waves className="w-12 h-12 text-white" />
              <h1 className="text-3xl font-bold text-white">Skjærgårdshelt</h1>
              <Recycle className="w-12 h-12 text-white" />
            </div>

            {/* Hero Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Bli en Skjærgårdshelt.
              <br />
              <span className="text-yellow-300">Rydd én strand.</span>
              <br />
              <span className="text-green-300">Forandre alt.</span>
            </h2>

            {/* Subtitle */}
            <div className="max-w-2xl mx-auto mb-12">
              <p className="text-xl text-blue-100 mb-4 leading-relaxed">
                Skjærgårdshelt gjør det synlig, enkelt og gøy å rydde kysten.
              </p>
              <p className="text-lg text-blue-200 mb-4">Få poeng for innsatsen. Vis verden hva du gjør.</p>
              <p className="text-lg text-blue-200 font-medium">
                Sammen bygger vi et renere hav – én pose avfall av gangen.
              </p>
            </div>

            {/* CTA Button */}
            <div className="mb-16">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-white text-ocean-blue hover:bg-gray-100 text-xl px-8 py-4 rounded-full font-bold shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  👉 Start nå – logg din første ryddeinnsats
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Hvorfor bli en Skjærgårdshelt?</h3>
            <p className="text-lg text-gray-600">Gjør en forskjell for miljøet mens du har det gøy</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100">
              <div className="w-16 h-16 bg-ocean-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Få poeng og nivåer</h4>
              <p className="text-gray-600">
                Samle poeng for hver ryddeinnsats og klatre på topplisten. Fra nybegynner til legende!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 border border-green-100">
              <div className="w-16 h-16 bg-forest-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Bygg fellesskap</h4>
              <p className="text-gray-600">
                Del dine ryddeinnsatser, inspirer andre og bli inspirert av kysthelter over hele Norge.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100">
              <div className="w-16 h-16 bg-ocean-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Spor din påvirkning</h4>
              <p className="text-gray-600">
                Se hvor mye avfall du har samlet og hvilke strender du har gjort renere. Data som teller!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-forest-green to-forest-green-light py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-12">Sammen gjør vi en forskjell</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-300 mb-2">🏖️</div>
              <div className="text-2xl font-bold text-white mb-1">Strender</div>
              <div className="text-green-200">ryddet ren</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-300 mb-2">♻️</div>
              <div className="text-2xl font-bold text-white mb-1">Avfall</div>
              <div className="text-green-200">samlet inn</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-300 mb-2">👥</div>
              <div className="text-2xl font-bold text-white mb-1">Helter</div>
              <div className="text-green-200">aktive</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-300 mb-2">🌊</div>
              <div className="text-2xl font-bold text-white mb-1">Hav</div>
              <div className="text-green-200">beskyttet</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-white py-16">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Klar til å bli en helt?</h3>
          <p className="text-lg text-gray-600 mb-8">
            Det tar bare 2 minutter å komme i gang. Din første ryddeinnsats venter!
          </p>

          <div className="space-y-4">
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-ocean-blue hover:bg-ocean-blue-dark text-white text-lg px-8 py-4 rounded-full font-bold w-full sm:w-auto"
              >
                Bli med nå - det er gratis! 🚀
              </Button>
            </Link>

            <div className="text-sm text-gray-500">
              Allerede medlem?{" "}
              <Link href="/auth" className="text-ocean-blue hover:underline font-medium">
                Logg inn her
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Waves className="w-6 h-6" />
            <span className="font-bold">Skjærgårdshelt</span>
            <Recycle className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-sm">Sammen for et renere hav og en bedre fremtid 🌊♻️</p>
        </div>
      </footer>
    </div>
  )
}
