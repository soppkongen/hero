import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Skjærgårdshelt - Coastal Cleanup Hero",
    short_name: "Skjærgårdshelt",
    description: "Connect with coastal cleanup heroes across Norway and gamify waste collection",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2D5016",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["social", "lifestyle", "utilities"],
    orientation: "portrait-primary",
  }
}
