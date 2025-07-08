import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Skjærgårdshelt - Coastal Cleanup Hero",
    template: "%s | Skjærgårdshelt",
  },
  description:
    "Connect with coastal cleanup heroes across Norway and gamify waste collection. Rydd én strand. Forandre alt.",
  keywords: ["coastal cleanup", "Norway", "environment", "gamification", "waste collection", "kystopprydning", "miljø"],
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
  openGraph: {
    type: "website",
    locale: "no_NO",
    url: "https://skjaergardshelt.vercel.app",
    siteName: "Skjærgårdshelt",
    title: "Skjærgårdshelt - Coastal Cleanup Hero",
    description: "Connect with coastal cleanup heroes across Norway and gamify waste collection",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Skjærgårdshelt - Coastal cleanup heroes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skjærgårdshelt - Coastal Cleanup Hero",
    description: "Connect with coastal cleanup heroes across Norway and gamify waste collection",
    images: ["/og-image.png"],
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
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Skjærgårdshelt" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2D5016" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
