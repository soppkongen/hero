import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Skjærgårdshelt - Coastal Cleanup Hero",
    short_name: "Skjærgårdshelt",
    description: "Connect with coastal cleanup heroes across Norway and gamify waste collection",
    start_url: "/velkommen",
    display: "standalone",
    background_color: "#2D5016",
    theme_color: "#2D5016",
    orientation: "portrait",
    scope: "/",
    lang: "no",
    categories: ["lifestyle", "social", "utilities"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/screenshot-desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  }
}
