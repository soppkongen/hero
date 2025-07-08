import type { Config } from "tailwindcss"
import defaultConfig from "shadcn/ui/tailwind.config"

const config: Config = {
  ...defaultConfig,
  content: [
    ...defaultConfig.content,
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    ...defaultConfig.theme,
    extend: {
      ...defaultConfig.theme.extend,
      colors: {
        ...defaultConfig.theme.extend.colors,
        "forest-green": {
          DEFAULT: "#2D5016",
          light: "#3A6B1C",
          dark: "#1F3A0F",
        },
        "ocean-blue": {
          DEFAULT: "#1E3A8A",
          light: "#1E40AF",
          dark: "#1E293B",
        },
        "light-gray": "#F8FAFC",
        "text-dark": "#1F2937",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
  safelist: [
    "bg-forest-green",
    "bg-forest-green-dark",
    "bg-ocean-blue",
    "bg-ocean-blue-light",
    "text-forest-green",
    "text-ocean-blue",
    "border-forest-green",
    "ring-forest-green",
  ],
}

export default config
