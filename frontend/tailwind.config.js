/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // EDI Brand Colors
        edi: {
          bg:      "#050816",
          card:    "rgba(255,255,255,0.04)",
          primary: "#00D4FF",
          accent:  "#7B61FF",
          success: "#00FF88",
          warning: "#FFB547",
          danger:  "#FF4757",
          muted:   "rgba(255,255,255,0.5)",
          border:  "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "edi-gradient":   "linear-gradient(135deg, #00D4FF, #7B61FF)",
        "edi-glow":       "radial-gradient(circle, rgba(0,212,255,0.15), transparent 70%)",
        "edi-hero":       "linear-gradient(180deg, #050816 0%, #0a0f1e 50%, #050816 100%)",
        "card-gradient":  "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(123,97,255,0.08))",
      },
      boxShadow: {
        "edi-glow":  "0 0 30px rgba(0,212,255,0.15)",
        "edi-card":  "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "edi-hover": "0 12px 40px rgba(0,212,255,0.2)",
      },
      animation: {
        "float":        "float 6s ease-in-out infinite",
        "pulse-slow":   "pulse 3s ease-in-out infinite",
        "fade-up":      "fadeUp 0.5s ease",
        "spin-slow":    "spin 20s linear infinite",
        "glow":         "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-12px)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          from: { boxShadow: "0 0 20px rgba(0,212,255,0.2)" },
          to:   { boxShadow: "0 0 40px rgba(0,212,255,0.5)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
