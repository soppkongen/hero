import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Header } from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Skjærgårdshelt - Coastal Cleanup Hero",
    template: "%s | Skjærgårdshelt",
  },
  description:
    "Bli en kystopprydningshelt! Rydd én strand, forandre alt. Få poeng for innsatsen, bygg fellesskap og vis verden hva du gjør for et renere hav. 🌊♻️🇳🇴",
  keywords: [
    "coastal cleanup",
    "Norway",
    "environment",
    "gamification",
    "waste collection",
    "kystopprydning",
    "miljø",
    "skjærgård",
    "plastforsøpling",
    "frivillig",
    "bærekraft",
  ],
  authors: [{ name: "Skjærgårdshelt Team" }],
  creator: "Skjærgårdshelt",
  publisher: "Skjærgårdshelt",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  themeColor: "#2D5016",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  generator: "v0.dev",
  metadataBase: new URL("https://skjaergardshelt.vercel.app"),

  // Enhanced Open Graph tags
  openGraph: {
    type: "website",
    locale: "no_NO",
    url: "https://skjaergardshelt.vercel.app",
    siteName: "Skjærgårdshelt",
    title: "Skjærgårdshelt - Bli en kystopprydningshelt! 🌊♻️",
    description:
      "Rydd én strand, forandre alt. Få poeng for innsatsen, bygg fellesskap og vis verden hva du gjør for et renere hav. Sammen bygger vi et renere Norge! 🇳🇴",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Skjærgårdshelt - Coastal cleanup heroes making a difference",
        type: "image/png",
      },
      {
        url: "/og-image-square.png",
        width: 1080,
        height: 1080,
        alt: "Skjærgårdshelt - Join the coastal cleanup movement",
        type: "image/png",
      },
    ],
  },

  // Enhanced Twitter Card tags
  twitter: {
    card: "summary_large_image",
    site: "@skjaergardshelt",
    creator: "@skjaergardshelt",
    title: "Skjærgårdshelt - Bli en kystopprydningshelt! 🌊♻️",
    description:
      "Rydd én strand, forandre alt. Få poeng for innsatsen, bygg fellesskap og vis verden hva du gjør for et renere hav. 🇳🇴",
    images: {
      url: "/og-image.png",
      alt: "Skjærgårdshelt - Coastal cleanup heroes making a difference",
    },
  },

  // Additional social media tags
  other: {
    // Facebook specific
    "fb:app_id": "skjaergardshelt",

    // Additional Open Graph
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/png",

    // Twitter specific
    "twitter:image:width": "1200",
    "twitter:image:height": "630",

    // App specific
    "apple-mobile-web-app-title": "Skjærgårdshelt",
    "application-name": "Skjærgårdshelt",

    // Additional SEO
    "theme-color": "#2D5016",
    "msapplication-TileColor": "#2D5016",
    "msapplication-navbutton-color": "#2D5016",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification tags (add these when you have accounts)
  verification: {
    // google: "your-google-verification-code",
    // other: {
    //   "facebook-domain-verification": "your-facebook-verification-code",
    // }
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Skjærgårdshelt" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2D5016" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Additional social media optimization */}
        <link rel="canonical" href="https://skjaergardshelt.vercel.app" />
        <meta name="referrer" content="origin-when-cross-origin" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen">
            <Header />
            <main className="pb-20">{children}</main>
            <Navigation />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
