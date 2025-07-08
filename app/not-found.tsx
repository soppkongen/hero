import Link from "next/link"
import { Waves, Recycle, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Waves className="w-12 h-12 text-ocean-blue animate-pulse" />
          <Recycle className="w-12 h-12 text-forest-green animate-pulse" />
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Siden ble ikke funnet</h2>
        <p className="text-gray-600 mb-8">Denne siden eksisterer ikke, eller den kan ha blitt flyttet.</p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-forest-green to-ocean-blue text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <Home className="w-5 h-5" />
          Tilbake til forsiden
        </Link>
      </div>
    </div>
  )
}
